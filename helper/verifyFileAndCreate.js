import fs from 'fs';

const verifyAndCreateFolder = (baseDir) => {

    // Destructuring directory by "/"
    let foldersName = baseDir.split('/');

    if (foldersName && foldersName.length > 0) {
        let joinPath = [];
        foldersName.forEach(folderName => {
            joinPath.push(folderName);
            let path = joinPath.join('/');
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path);
            }
        });
    }

};

export {
    verifyAndCreateFolder
}