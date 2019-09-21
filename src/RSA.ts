const NodeRSA = require('node-rsa');

// const pk = new NodeRSA('-----BEGIN RSA PRIVATE KEY-----\n' +
//   'MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAIFeN0EGju5naCM5NjLdFd3oUyfDeLgLgBjT+6LthfaigvLz419ZbTFcaoMKK7YvtFAqA12QxzK1LuViNpVfOxsGEHZ7tO9v4iWQbSE7n7vBLzS9DwPyeGKiA5I/2sRABWGBwPZr/Ucsb6kcpm94s6ZqXKG0q+wfXo1V7F8J+KdTAgMBAAECgYAmxEv8gXGdgYFUZNWYAmaGHBOnK81mIZQeXI/gsBrf4K0rDujI7uxoyU/lusuEieEX0K83f6YhzOejt32x31q/fNQXsfMfmh+uPWlSZQy229TPcPrzLJDqazQrAOcIOjKifOWkiKxOVyMgCYzG5iosR4q7xpaxXmSfGCqmjtHQ6QJBANZxDAi5vGh0uRL1ekKEXFghvTIpiFRNI58HWaerytsYrpC+yUYc2Pzm5THVWpRWud/Hja+qpWTmmtcxfjVgH0UCQQCacHgLXbnS3Y/GgoNebcUaxFk2UYEZVpNch67S14F3cxV33rBODbOocYi9xOnxCEezaJ+s6Apft42XdhTjI2m3AkEAlgcTT0t7CG2ZSi1aMw1def9o2Z57Fde+MzW2QPuM+gpjnzsLoDTwjseP1HSbYarnciuv8hXmjxhTfnjO/tLYLQJAQ5qX8eHFRhjWpv7aoqtKbL0mkDB9YqoTN53tWT4c3jzyWNaSNpio3ENWqDtabLhDKrXRr86jO+MNiA+YdRU7YQJBALwylrue17cPHpeu5lK88mGivef2E0XS6mkSVk5imKTSTc+D8iWP5ybh+nBPrkxkupuFCp2gGRDIEOo3RRMR7Hs=\n' +
//   '-----END RSA PRIVATE KEY-----')

const xxx = 'MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAIFeN0EGju5naCM5NjLdFd3oUyfDeLgLgBjT+6LthfaigvLz419ZbTFcaoMKK7YvtFAqA12QxzK1LuViNpVfOxsGEHZ7tO9v4iWQbSE7n7vBLzS9DwPyeGKiA5I/2sRABWGBwPZr/Ucsb6kcpm94s6ZqXKG0q+wfXo1V7F8J+KdTAgMBAAECgYAmxEv8gXGdgYFUZNWYAmaGHBOnK81mIZQeXI/gsBrf4K0rDujI7uxoyU/lusuEieEX0K83f6YhzOejt32x31q/fNQXsfMfmh+uPWlSZQy229TPcPrzLJDqazQrAOcIOjKifOWkiKxOVyMgCYzG5iosR4q7xpaxXmSfGCqmjtHQ6QJBANZxDAi5vGh0uRL1ekKEXFghvTIpiFRNI58HWaerytsYrpC+yUYc2Pzm5THVWpRWud/Hja+qpWTmmtcxfjVgH0UCQQCacHgLXbnS3Y/GgoNebcUaxFk2UYEZVpNch67S14F3cxV33rBODbOocYi9xOnxCEezaJ+s6Apft42XdhTjI2m3AkEAlgcTT0t7CG2ZSi1aMw1def9o2Z57Fde+MzW2QPuM+gpjnzsLoDTwjseP1HSbYarnciuv8hXmjxhTfnjO/tLYLQJAQ5qX8eHFRhjWpv7aoqtKbL0mkDB9YqoTN53tWT4c3jzyWNaSNpio3ENWqDtabLhDKrXRr86jO+MNiA+YdRU7YQJBALwylrue17cPHpeu5lK88mGivef2E0XS6mkSVk5imKTSTc+D8iWP5ybh+nBPrkxkupuFCp2gGRDIEOo3RRMR7Hs=';

export const key = new NodeRSA('-----BEGIN PRIVATE KEY-----' + xxx + '-----END PRIVATE KEY-----');
key.setOptions({encryptionScheme: 'pkcs1'});

// HINT: 这里是一个大坑, 鬼畜他这个加密和解密都是私钥
export const encrypt = (content: string) => key.encryptPrivate(content, 'base64', 'utf8');

export const decrypt = (content: string) => key.decrypt(content).toString('utf8');
