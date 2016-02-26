var http = require('http');

var Encryptor = function Encryptor(userKey){
  var CONST = {
    LENGTH: 26,
    ASCII_BASE: 97
  },
  key = userKey || null;


  function randInt (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  function forEach(arr, func){
    for (var i = 0; i < arr.length; i++) {
      func(arr[i], i);
    }
  }


  function genKey(){
    var chars = new Array(26),
        iter = 5;

    forEach(chars, function(item, i){
      chars[i] = String.fromCharCode(i + CONST.ASCII_BASE);
    });

    while(iter-- !== 0){
      forEach(chars, function(item, i){
        var tmp = chars[i],
            rand = randInt(0, CONST.LENGTH - 1);
        chars[i] = chars[rand];
        chars[rand] = tmp;
      });
    };
    return chars.join('');;
  }


  function shuffle(data, direction){
    var arrData = data.split('');
    if (direction === 'fwd'){
      return arrData.reduce(shuffleCharFwd, '');
    } else {
      return arrData.reduce(shuffleCharBwd, '')
    }

  }


  function shuffleCharFwd(prv, current){
    var current = current.toLowerCase(),
        offset = current.charCodeAt(0) - CONST.ASCII_BASE;
    if (offset < CONST.LENGTH && offset >= 0){
      return prv + key.charAt(offset);
    } else {
      return prv + current;
    }
  }


  function shuffleCharBwd(prv, current){
    var current = current.toLowerCase(),
        offset = key.indexOf(current);
    if (offset !== -1){
      return prv + String.fromCharCode(offset + CONST.ASCII_BASE);
    } else {
      return prv + current;
    }
  }


  function getLf(data){
    var dataLf = new Array(26);
    forEach(dataLf, function(item, i){
      dataLf[i] = {
        c: String.fromCharCode(i + CONST.ASCII_BASE),
        count: 0
      };
    });
    data = data.split('');
    forEach(data, function(item, i){
      var item = item.toLowerCase(),
          offset = item.charCodeAt(0) - CONST.ASCII_BASE;
      if ( offset < CONST.LENGTH && offset >= 0 ) {
        dataLf[offset].count += 1;
      }
    });
    dataLf.sort(function decCount(a, b){
      return b.count - a.count;
    });
    return dataLf;
  }


  function validKey(key){
    // TODO not legit
    return key && key.length == 26;
  }
  var out = {
    loadHttpFile: function(url, cbOut){
      var data = ''
      function cb(rsp){
        rsp.on('data', function onData(dataIn){
          data = data + dataIn;
        });
        rsp.on('end', function onEnd(){
          cbOut(data);
        })
      };
      http.get(url, cb);
    },
    setKey: function setKey(keyIn){
      if (!key){
        if (keyIn && !validKey(keyIn)) throw new Error('Invalid key.');
        keyIn?key = keyIn:key = key || genKey();
        console.log('Set key to ' + key);
      } else {
        key = keyIn;
        console.log('Reset key to ' + keyIn);
      }
    },
    getKey: function getKey(){
      return key;
    },
    enc: function enc( msg ){
      if (!key){
        this.setKey();
      }
      console.log('Encrypting using key ' + key);
      return shuffle(msg, 'fwd');
    },
    dec: function dec(option, cypher){
      var method = option.method || null,
          userKey = option.key || null;
      if ( method == 'lf' ) {
        var charEnglishLetterFreq = 'etaoinshrdlcumwfgypbvkjxqz',
            dictCypherLetterFreq = getLf(cypher),
            arrKey = new Array(26);
        forEach(charEnglishLetterFreq, function(englishChar, i){
          var cypherChar = dictCypherLetterFreq[i].c,
              offset = englishChar.charCodeAt(0) - CONST.ASCII_BASE;
          arrKey[offset] = cypherChar;
        });
        this.setKey(arrKey.join(''));
        return shuffle(cypher, 'bwd');
      } else if ( method == 'lfwf' ) {

      } else if ( method == 'key' ) {
        if(userKey){
          if (!validKey(userKey)) throw new Error('Invalid key.');
          key = userKey;
        } else {
          if (!key) throw new Error('Key is not set.');
        }
        console.log('Decrypting using key ' + key);
        return shuffle(cypher, 'bwd');
      } else {
        throw new Error('Method is illegal.')
      }
    },
  }
  return out;
};

var e = new Encryptor();
e.loadHttpFile('http://textfiles.com/stories/zombies.txt',
  function cb(data){
    var cypher = e.enc(data);
    // var msgByKey = e.dec({method: 'key'}, cypher);
    // console.log(msgByKey);
    var msgByLf = e.dec({method: 'lf'}, cypher);
    var keyByLf = e.getKey();
    console.log(msgByLf);
  });
