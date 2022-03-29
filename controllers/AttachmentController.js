const fs = require('fs');
const path = require('path');

class AttachmentController {
    upload(data) {
        console.log("data: ", data)
        if (requests().method === 'GET') {
            return 'attachment/upload_form.html';
        }

        if (data.files.file) {
            let tmpPath = data.files.file.filepath;
            let fileName = data.files.file.originalFilename;
            let destinationPath = path.join(configs().uploadDir, fileName);

            if (!fs.existsSync(configs().uploadDir)) {
                fs.mkdirSync(configs().uploadDir);
            }
            let readStream = fs.createReadStream(tmpPath);
            let writeStream = fs.createWriteStream(destinationPath);
            readStream.pipe(writeStream);
            readStream.on('end', function () {
                fs.unlinkSync(tmpPath);
            });

            return 'attachment/success_upload.html'
        }
    }
}

module.exports = AttachmentController;