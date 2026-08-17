const { faker } = require('@faker-js/faker');

const amount = 10;
images = [];

for(let i = 0; i < amount; i++){
    images.push(
        `https://source.unsplash.com/random/250x275?tech,abstract,pattern&sig=${i}`
    )
}


