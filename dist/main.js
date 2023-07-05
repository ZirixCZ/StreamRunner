"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const handleDownload = async (url, pwd) => {
    const response = await fetch(url);
    if (!response.ok || !response.body) {
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }
    const totalSize = Number(response.headers.get("content-length"));
    let downloadedSize = 0;
    const reader = response.body.getReader();
    return new Promise((resolve, reject) => {
        const fileStream = (0, fs_1.createWriteStream)(pwd);
        let lastProgress = 0;
        function updateProgress(progress) {
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(`Current iteration: ${progress.toFixed(2)}%`);
        }
        const pump = () => {
            reader
                .read()
                .then(({ done, value }) => {
                if (done) {
                    fileStream.end();
                    updateProgress(100);
                    console.log("\nDownload complete");
                    resolve();
                    return;
                }
                downloadedSize += value.length;
                fileStream.write(value);
                const progress = (downloadedSize / totalSize) * 100;
                if (progress - lastProgress >= 0.03) {
                    lastProgress = progress;
                    updateProgress(progress);
                }
                pump();
            })
                .catch(reject);
        };
        pump();
    });
};
const main = async () => {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error("Usage: npm run start <fileUrl> <pwd> <iterations | null>\n");
        console.log('example usage:\nnpm run start "https://software.download.prss.microsoft.com/dbazure/Win10_22H2_EnglishInternational_x64v1.iso?t=60fb728d-1286-47ff-a1a7-3f3065bda59f&e=1688680980&h=9ec02717e30457225a2de61dee25ee612e4fc07b51a938088b87bf93519e0e13" ./cancer\n');
        console.log("this would download cancer into ./cancer and would keep on doing it indefinitely");
        return;
    }
    const fileUrl = args[0];
    const pwd = args[1] ?? "./noname";
    const iterations = args[2] ?? undefined;
    try {
        for (let i = 0; i < parseInt(iterations) || iterations === undefined; i++) {
            await handleDownload(fileUrl, pwd);
        }
    }
    catch (error) {
        console.error(`Failed to download file: ${error}`);
    }
};
main();
