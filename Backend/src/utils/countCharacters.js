
const countCharacters = (text) => {
    const segmenter = new Intl.Segmenter('vi', {
        granularity: 'grapheme'
    });

    return [...segmenter.segment(text)].length;
};

module.exports = countCharacters;
