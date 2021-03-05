const Jimp = require('jimp');
const text2png = require('text2png');



const darkness1 = Math.floor(Math.random() * 2);
const darkness2 = darkness1 + 4;

const textImage = text2png('发财Victor', { color: getRandColor(darkness1), backgroundColor: "transparent", font: "30px sans-serif" })



new Jimp(100, 100, getRandColor(darkness2), function (err, backImage) {

    Jimp.read(textImage).then(function (image) {

        backImage.composite(image, image.getWidth() >= 100 ? 0 : (100 - image.getWidth()) / 2, (100 - image.getHeight()) / 2, {
            mode: Jimp.BLEND_MULTIPLY,
            opacitySource: 1,
            opacityDest: 1,
        })
            .getBufferAsync(image.getMIME())
            .then(function (imgBuffer) {
                var fs = require('fs');

                fs.writeFileSync('out.png', imgBuffer);

            })



    })
})


function makeAvatar (req,res,next){

    const darkness1 = Math.floor(Math.random() * 2);
    const darkness2 = darkness1 + 4;
    
    const textImage = text2png(req.body.userName, { color: getRandColor(darkness1), backgroundColor: "transparent", font: "30px sans-serif" })
    
    
    
    new Jimp(100, 100, getRandColor(darkness2), function (err, backImage) {
    
        Jimp.read(textImage).then(function (image) {
    
            backImage.composite(image, image.getWidth() >= 100 ? 0 : (100 - image.getWidth()) / 2, (100 - image.getHeight()) / 2, {
                mode: Jimp.BLEND_MULTIPLY,
                opacitySource: 1,
                opacityDest: 1,
            })
                .getBufferAsync(image.getMIME())
                .then(function (imgBuffer) {
                    req.files = [{
                        buffer: imgBuffer,
                        mimetype: image.getMIME(),
                     
                        originalname: req.body.userName + ".png",
                        size: imgBuffer.length,
                    }];
                    req.body.obj = JSON.stringify({
                        ownerName: req.body.userName,
                        uploadTime: Date.now(),
                    })
                    console.log(imgBuffer.length)
                    image.quality(60)
                    next()
                    return image
    
                })
    
    
    
        })
    })

}


function makeAvatar_(req, res, next) {



    // var fs = require('fs');
    // var text2png = require('text2png');
    // fs.writeFileSync('out.png', text2png('ds好!', {color: 'blue'}));




    //  const randomColor = Math.floor(Math.random() * 16777215);
    const randomColor = getRandColor(3)//"#" + ((1 << 24) * Math.random() | 0).toString(16)



    new Jimp(100, 100, randomColor, (err, image) => {

        Jimp.loadFont(Jimp.FONT_SANS_16_WHITE).then(function (font) {
            return image.print(font, 0, -10, {
                text: req.body.userName,
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
            }, 100, 100);
        }).then(function (image) {

            Jimp.loadFont(Jimp.FONT_SANS_16_BLACK).then(function (font) {

                image.composite(textImage, 0, 0);

                return image.print(font, 0, 10, {
                    text: req.body.userName,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                }, 100, 100);

            }).then(function (image) {


                image.getBufferAsync(image.getMIME()).then(function (imgBuffer) {


                    req.files = [{
                        buffer: imgBuffer,
                        mimetype: image.getMIME(),
                        oriantation: "verticle",
                        originalname: req.body.userName + ".png",
                        size: imgBuffer.length,
                    }];
                    req.body.obj = JSON.stringify({
                        ownerName: req.body.userName,
                        uploadTime: Date.now(),

                    })

                    console.log(imgBuffer.length)
                    image.quality(60)
                    next()
                    return image

                })




            })


        })

    });
}

function makeStrangerAvatarAndSend(req, res, next) {

    const randomColor = "#" + ((1 << 24) * Math.random() | 0).toString(16)
    // const text = req.params.username+"?"
    const text = "?"

    new Jimp(100, 100, randomColor, (err, image) => {


        Jimp.loadFont(Jimp.FONT_SANS_64_WHITE).then(function (font) {
            return image.print(font, -20, 0, {
                text: text,
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
            }, 100, 100);
        }).then(function (image) {

            Jimp.loadFont(Jimp.FONT_SANS_64_BLACK).then(function (font) {
                return image.print(font, 20, 0, {
                    text: text,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                }, 100, 100);

            }).then(function (image) {


                image.getBufferAsync(image.getMIME()).then(function (imgBuffer) {


                    res.header('content-type', image.getMIME());
                    res.header("access-control-expose-headers", "content-type")
                    res.header("file-name", encodeURIComponent(req.params.username + "_.jpg"))
                    res.header("access-control-expose-headers", "file-name")

                    res.header("content-length", imgBuffer.length)
                    res.header("access-control-expose-headers", "content-length") // this line can be omitted
                    res.write(imgBuffer)

                    res.end("", function () {
                        console.log(" === stranger avatar sent done ===")
                    });

                })




            })


        })

    })


}



function makeBackPicture(req, res, next) {

    var mainImage = new Jimp(100, 100, 0x0, function (err, image) {

        if (err) { return console.log("err in making BackPicture") }

        image.getBufferAsync(image.getMIME()).then(function (imgBuffer) {

            //    console.log(imgBuffer, image.getMIME())
            req.files = [{
                buffer: imgBuffer,
                mimetype: image.getMIME(),
                originalname: req.body.userName + "_backPicture.png",
                size: imgBuffer.length,
            }];
            req.body.obj = JSON.stringify({
                ownerName: req.body.userName,
                uploadTime: Date.now(),

            })

            //  console.log(req)

            console.log(imgBuffer.length)
            image.quality(60)
            next()
            return image

        })


        //     console.log(image.getBuffer(Jimp.AUTO))
        //    image.getBuffer()




    });

}




function getIconImageArray(req, res, next, ) {

    req.files.forEach(function (imgFile, index) {

        Jimp.read(imgFile.buffer).then(function (image) {


            image.resize(100, Jimp.AUTO).quality(60)
                .getBufferAsync(image.getMIME())
                .then(function (imgBuffer) {
                    req.files[index].buffer = imgBuffer;
                    req.files[index].size = imgBuffer.length;
                    if (index === req.files.length - 1) { next() }
                })
                .catch(err => { console.log("error in converting small avatar image ", err) })

        })
    })

}

function getAvatarImageArray(req, res, next) {

    req.files.forEach(function (imgFile, index) {
        Jimp.read(imgFile.buffer).then(function (image) {

            const { width, height } = image.bitmap;
            req.files[index].oriantation = width >= height ? "horizontal" : "verticle"

            image.resize(width <= height ? 100 : Jimp.AUTO, height <= width ? 100 : Jimp.AUTO)
                .crop(height > width ? 0 : (width * 100 / height - 100) / 2, 0, 100, 100)
                .quality(60) //image.scale(0.2)//.getBase64Async(Jimp.MIME_JPEG)//.writeAsync("aaa.png")
                .getBufferAsync(image.getMIME())
                .then(function (imgBuffer) {
                    req.files[index].buffer = imgBuffer;
                    req.files[index].size = imgBuffer.length;
                    if (index === req.files.length - 1) { next() }
                }).catch(err => { console.log("error in converting small avatar image ", err) })

        })
    })

}

function getSmallImageArray(req, res, next, ) {

    req.files.forEach(function (imgFile, index) {


        Jimp.read(imgFile.buffer).then(function (image) {

            const { width, height } = image.bitmap;
            req.files[index].oriantation = width >= height ? "horizontal" : "verticle"


            if (width * height >= 1000 * 1000) {
                image.resize(width >= height ? 1000 : Jimp.AUTO, height >= width ? 1000 : Jimp.AUTO)
                    .quality(60)
                    .getBufferAsync(image.getMIME())
                    .then(function (imgBuffer) {
                        req.files[index].buffer = imgBuffer;
                        req.files[index].size = imgBuffer.length;
                        if (index === req.files.length - 1) { next() }
                    }).catch(err => { console.log("error in converting small pic image ", err) })

            }
            else {
                if (index === req.files.length - 1) { next() }
            }
        }).catch(err => { console.log("error in Jimp reading file array ", err) })
    })

}




module.exports = {
    makeAvatar,
    makeBackPicture,
    getIconImageArray,
    getSmallImageArray,
    getAvatarImageArray,
    makeStrangerAvatarAndSend,

}



function get_random_color() {
    function c() {
        var hex = Math.floor(Math.random() * 256).toString(16);
        return ("0" + String(hex)).substr(-2); // pad with zero
    }
    return "#" + c() + c() + c();
}

function getRandColor(brightness) {

    // Six levels of brightness from 0 to 5, 0 being the darkest
    var rgb = [Math.random() * 256, Math.random() * 256, Math.random() * 256];
    var mix = [brightness * 51, brightness * 51, brightness * 51]; //51 => 255/5
    var mixedrgb = [rgb[0] + mix[0], rgb[1] + mix[1], rgb[2] + mix[2]].map(function (x) { return Math.round(x / 2.0) })
    return "rgb(" + mixedrgb.join(",") + ")";
}