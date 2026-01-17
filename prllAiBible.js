const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// For demo - in real project use JSON file, database, or API (like Bible API)
const bibleData = {
  john: {
    3: [
      // Verse 1
      {
        number: 1,
        KJV: "There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:",
        NIV: "Now there was a Pharisee, a man named Nicodemus who was a member of the Jewish ruling council.",
        ESV: "Now there was a man of the Pharisees named Nicodemus, a ruler of the Jews.",
        NLT: "There was a man named Nicodemus, a Jewish religious leader who was a Pharisee."
      },
      {
        number: 2,
        KJV: "The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher come from God: for no man can do these miracles that thou doest, except God be with him.",
        NIV: "He came to Jesus at night and said, “Rabbi, we know that you are a teacher who has come from God. For no one could perform the signs you are doing if God were not with him.”",
        ESV: "This man came to Jesus by night and said to him, “Rabbi, we know that you are a teacher come from God, for no one can do these signs that you do unless God is with him.”",
        NLT: "After dark one evening, he came to speak with Jesus. “Rabbi,” he said, “we all know that God has sent you to teach us. Your miraculous signs are evidence that God is with you.”"
      },
      // ... add all verses up to 36 (I show only first few + famous ones for brevity)
      {
        number: 1,
        KJV: "There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:",
        NIV: "Now there was a Pharisee, a man named Nicodemus who was a member of the Jewish ruling council.",
        ESV: "Now there was a man of the Pharisees named Nicodemus, a ruler of the Jews.",
        NLT: "There was a man named Nicodemus, a Jewish religious leader who was a Pharisee."
      },
      {
        number: 1,
        KJV: "There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:",
        NIV: "Now there was a Pharisee, a man named Nicodemus who was a member of the Jewish ruling council.",
        ESV: "Now there was a man of the Pharisees named Nicodemus, a ruler of the Jews.",
        NLT: "There was a man named Nicodemus, a Jewish religious leader who was a Pharisee."
      },
      {
        number: 1,
        KJV: "There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:",
        NIV: "Now there was a Pharisee, a man named Nicodemus who was a member of the Jewish ruling council.",
        ESV: "Now there was a man of the Pharisees named Nicodemus, a ruler of the Jews.",
        NLT: "There was a man named Nicodemus, a Jewish religious leader who was a Pharisee."
      },
      {
        number: 1,
        KJV: "There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:",
        NIV: "Now there was a Pharisee, a man named Nicodemus who was a member of the Jewish ruling council.",
        ESV: "Now there was a man of the Pharisees named Nicodemus, a ruler of the Jews.",
        NLT: "There was a man named Nicodemus, a Jewish religious leader who was a Pharisee."
      },
      {
        number: 1,
        KJV: "There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:",
        NIV: "Now there was a Pharisee, a man named Nicodemus who was a member of the Jewish ruling council.",
        ESV: "Now there was a man of the Pharisees named Nicodemus, a ruler of the Jews.",
        NLT: "There was a man named Nicodemus, a Jewish religious leader who was a Pharisee."
      },
      {
        number: 1,
        KJV: "There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:",
        NIV: "Now there was a Pharisee, a man named Nicodemus who was a member of the Jewish ruling council.",
        ESV: "Now there was a man of the Pharisees named Nicodemus, a ruler of the Jews.",
        NLT: "There was a man named Nicodemus, a Jewish religious leader who was a Pharisee."
      },
      {
        number: 1,
        KJV: "There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:",
        NIV: "Now there was a Pharisee, a man named Nicodemus who was a member of the Jewish ruling council.",
        ESV: "Now there was a man of the Pharisees named Nicodemus, a ruler of the Jews.",
        NLT: "There was a man named Nicodemus, a Jewish religious leader who was a Pharisee."
      },
      {
        number: 16,
        KJV: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
        NIV: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
        ESV: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
        NLT: "For this is how God loved the world: He gave his one and only Son, so that everyone who believes in him will not perish but have eternal life."
      },
      // Add remaining verses 3–15, 17–36 similarly...
      // Full chapter has 36 verses — you can copy from BibleGateway/BlueLetterBible
    ]
  }
};

app.get('/bible/:book/:chapter', (req, res) => {
  const { book, chapter } = req.params;
  const bookLower = book.toLowerCase();
  const chapNum = parseInt(chapter);

  const chapterData = bibleData[bookLower]?.[chapNum];

  if (!chapterData) {
    return res.status(404).send("Chapter not found");
  }

  res.render('chapter', {
    reference: `John ${chapNum}`,
    verses: chapterData,
    versions: [
      { abbr: "KJV", name: "King James Version" },
      { abbr: "NIV", name: "New International Version" },
      { abbr: "ESV", name: "English Standard Version" },
      { abbr: "NLT", name: "New Living Translation" }
    ]
  });
});

app.listen(3000, () => {
  console.log('Bible reader running → http://localhost:3000');
});