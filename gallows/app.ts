import * as readline from 'readline';
import * as fs from 'fs';

// Переменные игры
let selectedWord: string;
let guessedLetters: string[] = [];
let wrongGuesses: number = 0;
const maxWrongGuesses = 6;

// Создаем интерфейс для ввода
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Функция для чтения слов из файла
function loadWordsFromFile(filePath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        // Разделяем строки и фильтруем пустые строки
        const words = data.split('\n').map(word => word.trim()).filter(word => word.length > 0);
        resolve(words);
      }
    });
  });
}

// Начало игры
function startGame(words: string[]) {
  selectedWord = words[Math.floor(Math.random() * words.length)];
  guessedLetters = [];
  wrongGuesses = 0;
  console.log('Добро пожаловать в игру Виселица!');
  displayWord();
  askForLetter();
}

// Отображение текущего состояния слова
function displayWord() {
  const wordDisplay = selectedWord
    .split('')
    .map(letter => (guessedLetters.includes(letter) ? letter : '_'))
    .join(' ');
  console.log(`Слово: ${wordDisplay}`);
}

// Проверка состояния игры
function checkGameState() {
  if (!selectedWord.split('').some(letter => !guessedLetters.includes(letter))) {
    console.log('Поздравляем! Вы угадали слово!');
    rl.close();
  } else if (wrongGuesses >= maxWrongGuesses) {
    console.log(`Вы проиграли! Загаданное слово: ${selectedWord}`);
    rl.close();
  } else {
    askForLetter();
  }
}

// Отображение виселицы
function displayHangman() {
  const hangmanStages = [
    '_____\n|   |\n|\n|\n|\n|',
    '_____\n|   |\n|   O\n|\n|\n|',
    '_____\n|   |\n|   O\n|   |\n|\n|',
    '_____\n|   |\n|   O\n|  /|\n|\n|',
    '_____\n|   |\n|   O\n|  /|\\\n|\n|',
    '_____\n|   |\n|   O\n|  /|\\\n|  /\n|',
    '_____\n|   |\n|   O\n|  /|\\\n|  / \\\n|',
  ];
  console.log(hangmanStages[wrongGuesses]);
}

// Запрашиваем букву у пользователя
function askForLetter() {
  rl.question('Введите букву: ', letter => {
    letter = letter.toLowerCase();
    if (letter.length !== 1 || !/[a-zа-яё]/.test(letter)) {
      console.log('Пожалуйста, введите одну букву.');
    } else if (guessedLetters.includes(letter)) {
      console.log('Эта буква уже была угадана.');
    } else if (selectedWord.includes(letter)) {
      console.log('Правильно!');
      guessedLetters.push(letter);
    } else {
      console.log('Неправильно!');
      guessedLetters.push(letter);
      wrongGuesses++;
      displayHangman();
    }
    displayWord();
    checkGameState();
  });
}

// Загрузка слов из файла и запуск игры
loadWordsFromFile('dictionary/words.txt')
  .then(words => {
    if (words.length === 0) {
      console.log('Файл words.txt пуст или не содержит допустимых слов.');
      rl.close();
    } else {
      startGame(words);
    }
  })
  .catch(err => {
    console.error(`Ошибка при чтении файла: ${err.message}`);
    rl.close();
  });
