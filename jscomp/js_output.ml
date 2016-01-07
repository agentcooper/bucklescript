(* OCamlScript compiler
 * Copyright (C) 2015-2016 Bloomberg Finance L.P.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, with linking exception;
 * either version 2.1 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
 *)

(* Author: Hongbo Zhang  *)



module E = J_helper.Exp 
module S = J_helper.Stmt 

type finished = 
  | True 
  | False 
  | Dummy (* Have no idea, so that when [++] is applied, always use the other *)

type t  =  { 
  block : J.block ;
  value : J.expression option;
  finished : finished ; 
    (** When [finished] is true the block is already terminated, value does not make sense
        default is false, false is  an conservative approach 
     *)
}

type st = Lam_compile_defs.st 

let make ?value ?(finished=False) block = {block ; value ; finished }

let of_stmt ?value ?(finished = False) stmt = {block = [stmt] ; value ; finished }

let of_block ?value ?(finished = False) block = 
  {block  ; value ; finished }

let dummy = {value = None; block = []; finished = Dummy }

let handle_name_tail (name : st) (should_return : Lam_compile_defs.return_type)
    lam (exp : J.expression) : t =
  begin match name, should_return with 
  | EffectCall, False -> 
      if Lam_util.no_side_effects lam 
      then dummy
      else {block = []; value  = Some exp ; finished = False}
  | EffectCall, True _ ->
      make [S.return  exp] ~finished:True
  | Declare (kind, n), False -> 
      make [ S.define ~kind n  exp]
  | Assign n ,False -> 
      make [S.assign n exp ]
  | (Declare _ | Assign _ ), True _ -> 
      make [S.unknown_lambda lam] ~finished:True
  | NeedValue, _ -> {block = []; value = Some exp; finished = False }
  end

let handle_block_return (st : st) (should_return : Lam_compile_defs.return_type) (lam : Lambda.lambda) (block : J.block) exp : t = 
  match st, should_return with 
  | Declare (kind,n), False -> 
      make (block @ [ S.define ~kind  n exp])
  | Assign n, False -> make (block @ [S.assign n exp])
  | (Declare _ | Assign _), True _ -> make [S.unknown_lambda lam] ~finished:True
  | EffectCall, False -> make block ~value:exp
  | EffectCall, True _ -> make (block @ [S.return exp]) ~finished:True
  | NeedValue, _ ->  make block ~value:exp

let statement_of_opt_expr (x : J.expression option) : J.statement =
  match x with 
  | None -> S.empty ()
  | Some x when J_helper.no_side_effect x -> S.empty ()
        (* TODO, pure analysis in lambda instead *)
  | Some x -> S.exp x 

let rec unroll_block (block : J.block) = 
  match block with 
  | [{statement_desc = Block block}] -> unroll_block block 
  |  _ -> block 

let to_block ( x : t)  : J.block = 
  match x with 
  | {block; value = opt; finished} ->
      let block = unroll_block block in
      if finished = True  then block
      else 
        begin match opt with 
        | None -> block (* TODO, pure analysis in lambda instead *)
        | Some x when J_helper.no_side_effect x -> block
        | Some x -> block @ [S.exp x ]
        end

let to_break_block (x : t) : J.block * bool = 
    match x with 
    | {finished = True; block ; _ } -> 
        unroll_block block, false 
       (* value does not matter when [finished] is true
           TODO: check if it has side efects
        *)
    | {block; value =  None; finished } -> 
        let block = unroll_block block in 
        block, (match finished with | True -> false | (False | Dummy)  -> true  )

    | {block; value = opt; _} -> 
        let block = unroll_block block in
        block @ [statement_of_opt_expr opt], true

let rec append  (x : t ) (y : t ) : t =  
    match x , y with (* ATTTENTION: should not optimize [opt_e2], it has to conform to [NeedValue]*)
    | {finished = True; _ }, _ -> x  
    | _, {block = []; value= None; finished = Dummy } -> x 
          (* finished = true --> value = E.undefined otherwise would throw*)
    | {block = []; value= None; _ }, y  -> y 
    | {block = []; value= Some _; _}, {block = []; value= None; _ } -> x 
    | {block = []; value =  Some e1; _}, ({block = []; value = Some e2; finished } as z) -> 
        if J_helper.no_side_effect e1 
        then z
            (* It would optimize cases like [module aliases]
                Bigarray, List 
             *)
        else
          {block = []; value = Some (E.seq e1 e2); finished}
          (* {block = [S.exp e1]; value =  Some e2(\* (E.seq e1 e2) *\); finished} *)

       (** TODO: make everything expression make inlining hard, and code not readable?

           1. readability pends on how we print the expression 
           2. inlining needs generate symbols, which are statements, type mismatch
              we need capture [Exp e]

           can we call them all [statement]? statement has no value 
        *)
    (* | {block = [{statement_desc = Exp e }]; value = None ; _}, _ *)
    (*   -> *)
    (*     append { x with block = []; value = Some e} y *)
    (* |  _ , {block = [{statement_desc = Exp e }]; value = None ; _} *)
    (*   -> *)
    (*     append x { y with block = []; value = Some e} *)

    | {block = block1; value = opt_e1; _},  {block = block2; value = opt_e2; finished} -> 
        let block1 = unroll_block block1 in
        make (block1 @ (statement_of_opt_expr opt_e1  :: unroll_block block2))
          ?value:opt_e2 ~finished


module Ops = struct 
  let (++)  (x : t ) (y : t ) : t =  append x y 
end

(* Fold right is more efficient *)
let concat (xs : t list) : t = 
  List.fold_right (fun x acc -> append x  acc) xs dummy
