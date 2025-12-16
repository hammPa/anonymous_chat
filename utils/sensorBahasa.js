const daftarKataKasar = ["anjing", "babi", "bangsat", "bgst", "bgsd", "asu", "asw", "bab1", "b4b1", "4njg", "4nj6", "anjg"];

const mengandungKataKasar = teks => daftarKataKasar.some(kata => teks.toLowerCase().includes(kata));

module.exports = { mengandungKataKasar };