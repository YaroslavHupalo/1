const fs = require('fs');
const readline = require('readline');
const EventEmitter = require('events');
const path = require('path');

class FileManager extends EventEmitter {
    constructor() {
        super();
        this.on('create', this.createFileOrDirectory);
        this.on('read', this.readFileOrDirectory);
        this.on('update', this.updateFileOrRename);
        this.on('delete', this.deleteFileOrDirectory);
    }

    createFileOrDirectory(name, isDirectory = false) {
        if (isDirectory) {
            fs.mkdir(name, { recursive: true }, err => {
                if (err) return console.error(`Помилка створення каталогу: ${err.message}`);
                console.log(`Каталог "${name}" створено успішно!`);
            });
        } else {
            fs.writeFile(name, '', err => {
                if (err) return console.error(`Помилка створення файлу: ${err.message}`);
                console.log(`Файл "${name}" створено успішно!`);
            });
        }
    }

    readFileOrDirectory(name) {
        fs.stat(name, (err, stats) => {
            if (err) return console.error(`Помилка доступу: ${err.message}`);
            if (stats.isDirectory()) {
                fs.readdir(name, (err, files) => {
                    if (err) return console.error(`Помилка читання каталогу: ${err.message}`);
                    console.log(`Вміст каталогу "${name}":`, files.join(', '));
                });
            } else {
                fs.readFile(name, 'utf8', (err, data) => {
                    if (err) return console.error(`Помилка читання файлу: ${err.message}`);
                    console.log(`Вміст файлу "${name}":\n${data}`);
                });
            }
        });
    }

    updateFileOrRename(name, dataOrNewName, isRename = false) {
        if (isRename) {
            fs.rename(name, dataOrNewName, err => {
                if (err) return console.error(`Помилка перейменування: ${err.message}`);
                console.log(`"${name}" перейменовано в "${dataOrNewName}"`);
            });
        } else {
            fs.appendFile(name, dataOrNewName + '\n', err => {
                if (err) return console.error(`Помилка запису до файлу: ${err.message}`);
                console.log(`Дані додано до файлу "${name}"`);
            });
        }
    }

    deleteFileOrDirectory(name) {
        fs.stat(name, (err, stats) => {
            if (err) return console.error(`Помилка доступу: ${err.message}`);
            if (stats.isDirectory()) {
                fs.rmdir(name, { recursive: true }, err => {
                    if (err) return console.error(`Помилка видалення каталогу: ${err.message}`);
                    console.log(`Каталог "${name}" видалено`);
                });
            } else {
                fs.unlink(name, err => {
                    if (err) return console.error(`Помилка видалення файлу: ${err.message}`);
                    console.log(`Файл "${name}" видалено`);
                });
            }
        });
    }
}

const fileManager = new FileManager();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function mainMenu() {
    rl.question(
        `> Виберіть дію:\n1 - Створити файл/каталог\n2 - Читати файл/каталог\n3 - Оновити/перейменувати файл/каталог\n4 - Видалити файл/каталог\n5 - Вийти\n> Введіть номер дії: `,
        answer => {
            switch (answer) {
                case '1':
                    rl.question('> Введіть назву: ', name => {
                        rl.question('> Це каталог? (y/n): ', dir => {
                            fileManager.emit('create', name, dir.toLowerCase() === 'y');
                            setTimeout(mainMenu, 500);
                        });
                    });
                    break;
                case '2':
                    rl.question('> Введіть назву для читання: ', name => {
                        fileManager.emit('read', name);
                        setTimeout(mainMenu, 500);
                    });
                    break;
                case '3':
                    rl.question('> Введіть назву: ', name => {
                        rl.question('> Що робити: 1 - Додати текст, 2 - Перейменувати: ', act => {
                            if (act === '1') {
                                rl.question('> Введіть текст: ', data => {
                                    fileManager.emit('update', name, data);
                                    setTimeout(mainMenu, 500);
                                });
                            } else if (act === '2') {
                                rl.question('> Введіть нову назву: ', newName => {
                                    fileManager.emit('update', name, newName, true);
                                    setTimeout(mainMenu, 500);
                                });
                            }
                        });
                    });
                    break;
                case '4':
                    rl.question('> Введіть назву для видалення: ', name => {
                        fileManager.emit('delete', name);
                        setTimeout(mainMenu, 500);
                    });
                    break;
                case '5':
                    console.log('Завершення програми.');
                    rl.close();
                    break;
                default:
                    console.log('Невірна команда.');
                    mainMenu();
            }
        }
    );
}

mainMenu();