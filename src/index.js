const fs = require('fs');
const S3 = require('aws-sdk/clients/s3');

const form = new FormData();
const s3 = new S3({ region: 'us-east-1' });

async function getPresignedUrl() {
  return new Promise(async (resolve, reject) => {
    s3.createPresignedPost(
      {
        Bucket: 'devel-file-service',
        Fields: { key: 'ok.txt', 'x-amz-storage-class': 'INTELLIGENT_TIERING' },
      },
      (err, data) => {
        if (!err) {
          resolve(data);
        }

        reject(err);
      }
    );
  });
}

async function postFile(presignedUrl) {
  fs.writeFileSync('../teste.txt', 'test presigned url');
  const file = fs.readFileSync('../teste.txt');

  Object.keys(presignedUrl.fields).forEach((key) => {
    form.append(key, presignedUrl.fields[key]);
  });

  form.append('file', new Blob([file]));

  const result = await fetch(presignedUrl.url, {
    method: 'POST',
    body: form,
  });

  if (!result.ok) {
    console.log(`error upload [msg to error:${result.statusText}]`);
    return;
  }

  console.log('upload successfully');
  return;
}

async function run() {
  const data = await getPresignedUrl();
  await postFile(data);
}

run();
