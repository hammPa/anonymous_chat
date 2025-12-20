// client_id -> nomor anonim
const userAnonMap = new Map();

// nomor anonim yang sedang online
const anonimAktif = new Set();

// ambil id anonim terkecil yang belum dipakai
function ambilIdAnonimKosong() {
  let id = 1;
  while (anonimAktif.has(id)) id++;
  return id;
}


module.exports = { userAnonMap, anonimAktif, ambilIdAnonimKosong };