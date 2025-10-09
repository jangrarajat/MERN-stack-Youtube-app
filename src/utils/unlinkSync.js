



function unlink(filePath) {
    if (filePath) {
        try {
            fs.unlinkSync(filePath);
            console.log("file deleted successfully.",`${filePath}`);
        } catch (error) {
            console.error("Error deleting  file:", error);
        }
    }

}

export {unlink}