//all requires
const request = require('request');
var fileContents;
const APIkey = "dict.1.1.20170610T055246Z.0f11bdc42e7b693a.eefbde961e10106a4efa7d852287caa49ecc68cf";
//get file content to var using request
request('http://norvig.com/big.txt', (err, res, body) => {
    if (err) {
        return console.log(err);
    }
    fileContents = body;
    // console.log(fileContents.length);
    var top10Words = getUniqueWordAndFrequency(fileContents, 10);
    // console.log(top10Words.length);
    processWords(top10Words.topwords).then(function (outputJson) {
        console.log({
            "output": outputJson
        });
    }, function (err) {
        console.error(err);
    });

    // console.log(getUniqueWordAndFrequency(fileContents, 10));
    // console.log(top10Words.topwords.forEach(word => {
    //     console.log(word.word);
    // }));
    //   console.log(body.url);
    //   console.log(body);
}, function (err) {
    console.error(err);
});

function processWords(top10Words) {
    return new Promise(function (resolve, reject) {
        var outputArray = [];
        // console.log("me:"+top10Words);
        // console.log("me2:"+top10Words.length);
        // try {
        var apisToBeCalled = top10Words.length;
        for (let index = 0; index < top10Words.length; index++) {
            console.log(index);
            console.log(top10Words.length);
            var wordElement = top10Words[index];
            console.log(wordElement);
            var wordDetailsApi = getWordDetails(wordElement);
            wordDetailsApi.then(function (wordDetails) {
                console.log(apisToBeCalled + " more..!");
                outputArray.push({
                    "word": wordDetails[1].word,
                    "count": wordDetails[1].count,
                    "synonyms": (wordDetails[0].def) ? wordDetails[0].def[0].tr : "No Synonyms found",
                    "pos": (wordDetails[0].def) ? wordDetails[0].def[0].pos : "No Part of speech found"

                });
                apisToBeCalled--;
                console.log(index, apisToBeCalled);
                if (apisToBeCalled === 0) {
                    console.log("Last callback call at index " + apisToBeCalled);
                    // console.log(outputArray);
                    resolve(outputArray);
                }
            }, function (err) {
                console.error(err);
            });
        };
        // } catch (err) {
        //     console.error(err);
        //     reject(err);
        // }
    });
}

function getWordDetails(wordElement) {
    return new Promise(function (resolve, reject) {
        request('https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=' + APIkey + '&lang=en-en&text=' + wordElement.word, (err, res, body) => {
            if (err) {
                //console.log(err);
                reject(err);
            }
            // fileContents = body;
            // console.log(fileContents.length);
            // console.log(getUniqueWordFrequency(fileContents, 10));
            //   console.log(body.url);
            console.log("resolving " + wordElement.word);
            resolve([body, wordElement]);
            // console.log(body);
        });
    });
}

function getUniqueWordAndFrequency(string, cutOff) {
    var cleanString = string.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, ""),
        words = cleanString.split(' '),
        frequencies = {},
        word, i;

    //to filter all empty elements from the array
    words = words.filter(entry => /\S/.test(entry));

    for (i = 0; i < words.length; i++) {
        word = words[i];
        frequencies[word] = frequencies[word] || 0;
        frequencies[word]++;
    }

    words = Object.keys(frequencies);

    var topWordArray = words.sort(function (a, b) {
        // console.log(frequencies[b] - frequencies[a]);
        return frequencies[b] - frequencies[a];
    }).slice(0, cutOff);
    var returnArray = [];
    topWordArray.forEach(word => {
        // console.log("word: " + word + ", " + frequencies[word]);
        returnArray.push({
            "word": word,
            "count": frequencies[word]
        });
    });
    returnArray = returnArray.filter(entry => /\S/.test(entry));
    var returnJson = {
        "topwords": returnArray
    };
    return returnJson;
}