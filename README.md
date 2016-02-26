# CaesarCipher
Caesar cipher encrypt and decrypt implemented in Javascript, including decryption by letter frequency.

## How to use:
```
var e = new Encryptor();

e.loadHttpFile('http://textfiles.com/stories/zombies.txt',
  function cb(data){

    var cypher = e.enc(data); // Encryption

    var msgByKey = e.dec({method: 'key'}, cypher); // Decryption using key
    console.log(msgByKey);

    var msgByLf = e.dec({method: 'lf'}, cypher); // Decryption using letter frequency - 'etaoinshrdlcumwfgypbvkjxqz'

    var keyByLf = e.getKey(); // Key generated using letter frequency
    console.log(msgByLf);

  });
```
