var pbkdf2 = require('pbkdf2');
var crypto = require('crypto')

var pbkdf2Salt = 'salt';
const localStorageKey = 'ciphertext';
const pbkdf2HashAlgo = 'sha512';
const algorithm = 'aes-256-gcm';
const encoding = 'base64'; // base64 or hex

function storeData(password, plaintext) {
    var derivedKey = pbkdf2.pbkdf2Sync(password, pbkdf2Salt, 100, 32, pbkdf2HashAlgo);
    var key = Buffer.from(derivedKey);
    var iv = new Buffer(crypto.randomBytes(16));

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', encoding);
    encrypted += cipher.final(encoding);
    var auth = cipher.getAuthTag();

    window.localStorage.setItem(localStorageKey, JSON.stringify({ 
        'ciphertext': encrypted,
        'iv': iv.toString(encoding),
        'auth': auth.toString(encoding)
    }))
}

function loadData(password) {
    var derivedKey = pbkdf2.pbkdf2Sync(password, pbkdf2Salt, 100, 32, pbkdf2HashAlgo);
    var key = Buffer.from(derivedKey);

    var e = JSON.parse(window.localStorage.getItem(localStorageKey))
    encrypted = e['ciphertext']
    iv = new Buffer(e['iv'], encoding)
    auth = new Buffer(e['auth'], encoding)

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(auth);
    let decrypted = decipher.update(encrypted, encoding, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted
}

storeData('secret123.-', 'Hello world');
document.write(loadData('secret123.-'));
