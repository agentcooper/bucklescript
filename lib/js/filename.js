// GENERATED CODE BY BUCKLESCRIPT VERSION 0.5.5 , PLEASE EDIT WITH CARE
'use strict';

var Caml_builtin_exceptions = require("./caml_builtin_exceptions");
var CamlinternalLazy        = require("./camlinternalLazy");
var Caml_sys                = require("./caml_sys");
var Pervasives              = require("./pervasives");
var Block                   = require("./block");
var Curry                   = require("./curry");
var Printf                  = require("./printf");
var Buffer                  = require("./buffer");
var $$String                = require("./string");
var Random                  = require("./random");

function generic_basename(is_dir_sep, current_dir_name, name) {
  if (name === "") {
    return current_dir_name;
  }
  else {
    var _n = name.length - 1 | 0;
    while(true) {
      var n = _n;
      if (n < 0) {
        return $$String.sub(name, 0, 1);
      }
      else if (Curry._2(is_dir_sep, name, n)) {
        _n = n - 1 | 0;
        continue ;
        
      }
      else {
        var _n$1 = n;
        var p = n + 1 | 0;
        while(true) {
          var n$1 = _n$1;
          if (n$1 < 0) {
            return $$String.sub(name, 0, p);
          }
          else if (Curry._2(is_dir_sep, name, n$1)) {
            return $$String.sub(name, n$1 + 1 | 0, (p - n$1 | 0) - 1 | 0);
          }
          else {
            _n$1 = n$1 - 1 | 0;
            continue ;
            
          }
        };
      }
    };
  }
}

function generic_dirname(is_dir_sep, current_dir_name, name) {
  if (name === "") {
    return current_dir_name;
  }
  else {
    var _n = name.length - 1 | 0;
    while(true) {
      var n = _n;
      if (n < 0) {
        return $$String.sub(name, 0, 1);
      }
      else if (Curry._2(is_dir_sep, name, n)) {
        _n = n - 1 | 0;
        continue ;
        
      }
      else {
        var _n$1 = n;
        while(true) {
          var n$1 = _n$1;
          if (n$1 < 0) {
            return current_dir_name;
          }
          else if (Curry._2(is_dir_sep, name, n$1)) {
            var _n$2 = n$1;
            while(true) {
              var n$2 = _n$2;
              if (n$2 < 0) {
                return $$String.sub(name, 0, 1);
              }
              else if (Curry._2(is_dir_sep, name, n$2)) {
                _n$2 = n$2 - 1 | 0;
                continue ;
                
              }
              else {
                return $$String.sub(name, 0, n$2 + 1 | 0);
              }
            };
          }
          else {
            _n$1 = n$1 - 1 | 0;
            continue ;
            
          }
        };
      }
    };
  }
}

var current_dir_name = ".";

function is_dir_sep(s, i) {
  return +(s[i] === "/");
}

function is_relative(n) {
  if (n.length < 1) {
    return /* true */1;
  }
  else {
    return +(n.charCodeAt(0) !== /* "/" */47);
  }
}

function is_implicit(n) {
  if (is_relative(n) && (n.length < 2 || $$String.sub(n, 0, 2) !== "./")) {
    if (n.length < 3) {
      return /* true */1;
    }
    else {
      return +($$String.sub(n, 0, 3) !== "../");
    }
  }
  else {
    return /* false */0;
  }
}

function check_suffix(name, suff) {
  if (name.length >= suff.length) {
    return +($$String.sub(name, name.length - suff.length | 0, suff.length) === suff);
  }
  else {
    return /* false */0;
  }
}

var temp_dir_name;

try {
  temp_dir_name = Caml_sys.caml_sys_getenv("TMPDIR");
}
catch (exn){
  temp_dir_name = "/tmp";
}

function quote(param) {
  var quotequote = "'\\''";
  var s = param;
  var l = s.length;
  var b = Buffer.create(l + 20 | 0);
  Buffer.add_char(b, /* "'" */39);
  for(var i = 0 ,i_finish = l - 1 | 0; i <= i_finish; ++i){
    if (s[i] === "'") {
      Buffer.add_string(b, quotequote);
    }
    else {
      Buffer.add_char(b, s.charCodeAt(i));
    }
  }
  Buffer.add_char(b, /* "'" */39);
  return Buffer.contents(b);
}

function basename(param) {
  return generic_basename(is_dir_sep, current_dir_name, param);
}

function dirname(param) {
  return generic_dirname(is_dir_sep, current_dir_name, param);
}

var temp_dir_name$1;

try {
  temp_dir_name$1 = Caml_sys.caml_sys_getenv("TEMP");
}
catch (exn$1){
  temp_dir_name$1 = ".";
}

var temp_dir_name$2 = temp_dir_name;

var is_dir_sep$1 = is_dir_sep;

var dir_sep = "/";

function concat(dirname, filename) {
  var l = dirname.length;
  if (l === 0 || Curry._2(is_dir_sep$1, dirname, l - 1 | 0)) {
    return dirname + filename;
  }
  else {
    return dirname + (dir_sep + filename);
  }
}

function chop_suffix(name, suff) {
  var n = name.length - suff.length | 0;
  if (n < 0) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "Filename.chop_suffix"
        ];
  }
  else {
    return $$String.sub(name, 0, n);
  }
}

function chop_extension(name) {
  var _i = name.length - 1 | 0;
  while(true) {
    var i = _i;
    if (i < 0 || Curry._2(is_dir_sep$1, name, i)) {
      throw [
            Caml_builtin_exceptions.invalid_argument,
            "Filename.chop_extension"
          ];
    }
    else if (name[i] === ".") {
      return $$String.sub(name, 0, i);
    }
    else {
      _i = i - 1 | 0;
      continue ;
      
    }
  };
}

var prng = Block.__(246, [function () {
      return Curry._1(Random.State[/* make_self_init */1], /* () */0);
    }]);

function temp_file_name(temp_dir, prefix, suffix) {
  var tag = prng.tag | 0;
  var rnd = Curry._1(Random.State[/* bits */3], tag === 250 ? prng[0] : (
          tag === 246 ? CamlinternalLazy.force_lazy_block(prng) : prng
        )) & 16777215;
  return concat(temp_dir, Curry._3(Printf.sprintf(/* Format */[
                      /* String */Block.__(2, [
                          /* No_padding */0,
                          /* Int */Block.__(4, [
                              /* Int_x */6,
                              /* Lit_padding */Block.__(0, [
                                  /* Zeros */2,
                                  6
                                ]),
                              /* No_precision */0,
                              /* String */Block.__(2, [
                                  /* No_padding */0,
                                  /* End_of_format */0
                                ])
                            ])
                        ]),
                      "%s%06x%s"
                    ]), prefix, rnd, suffix));
}

var current_temp_dir_name = [temp_dir_name$2];

function set_temp_dir_name(s) {
  current_temp_dir_name[0] = s;
  return /* () */0;
}

function get_temp_dir_name() {
  return current_temp_dir_name[0];
}

function temp_file($staropt$star, prefix, suffix) {
  var temp_dir = $staropt$star ? $staropt$star[0] : current_temp_dir_name[0];
  var _counter = 0;
  while(true) {
    var counter = _counter;
    var name = temp_file_name(temp_dir, prefix, suffix);
    try {
      (function () {
            throw "caml_sys_close not implemented by bucklescript yet\n";
          }());
      return name;
    }
    catch (e){
      if (e[0] === Caml_builtin_exceptions.sys_error) {
        if (counter >= 1000) {
          throw e;
        }
        else {
          _counter = counter + 1 | 0;
          continue ;
          
        }
      }
      else {
        throw e;
      }
    }
  };
}

function open_temp_file($staropt$star, $staropt$star$1, prefix, suffix) {
  var mode = $staropt$star ? $staropt$star[0] : /* :: */[
      /* Open_text */7,
      /* [] */0
    ];
  var temp_dir = $staropt$star$1 ? $staropt$star$1[0] : current_temp_dir_name[0];
  var _counter = 0;
  while(true) {
    var counter = _counter;
    var name = temp_file_name(temp_dir, prefix, suffix);
    try {
      return /* tuple */[
              name,
              Pervasives.open_out_gen(/* :: */[
                    /* Open_wronly */1,
                    /* :: */[
                      /* Open_creat */3,
                      /* :: */[
                        /* Open_excl */5,
                        mode
                      ]
                    ]
                  ], 384, name)
            ];
    }
    catch (e){
      if (e[0] === Caml_builtin_exceptions.sys_error) {
        if (counter >= 1000) {
          throw e;
        }
        else {
          _counter = counter + 1 | 0;
          continue ;
          
        }
      }
      else {
        throw e;
      }
    }
  };
}

var current_dir_name$1 = current_dir_name;

var parent_dir_name = "..";

var is_relative$1 = is_relative;

var is_implicit$1 = is_implicit;

var check_suffix$1 = check_suffix;

var basename$1 = basename;

var dirname$1 = dirname;

var quote$1 = quote;

exports.current_dir_name  = current_dir_name$1;
exports.parent_dir_name   = parent_dir_name;
exports.dir_sep           = dir_sep;
exports.concat            = concat;
exports.is_relative       = is_relative$1;
exports.is_implicit       = is_implicit$1;
exports.check_suffix      = check_suffix$1;
exports.chop_suffix       = chop_suffix;
exports.chop_extension    = chop_extension;
exports.basename          = basename$1;
exports.dirname           = dirname$1;
exports.temp_file         = temp_file;
exports.open_temp_file    = open_temp_file;
exports.get_temp_dir_name = get_temp_dir_name;
exports.set_temp_dir_name = set_temp_dir_name;
exports.temp_dir_name     = temp_dir_name$2;
exports.quote             = quote$1;
/* match Not a pure module */
