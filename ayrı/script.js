const baslangicLimitleri = { "mat": 6, "fiz": 4, "kim": 4, "biyo": 4, "ing": 4, "edb": 5, "alm": 3, "beden": 2 ,"tarih": 2,"resim":1};
  let guncelStoklar = { ...baslangicLimitleri };

  const dersKurallari = {
      "mat": { blok: true,  gunlukMax: 2, maxGunSayisi: 3},
      "fiz": { blok: true,  gunlukMax: 2, maxGunSayisi: 2},
      "kim": { blok: true,  gunlukMax: 2, maxGunSayisi: 2},
      "biyo":{ blok: true,  gunlukMax: 2, maxGunSayisi: 2},
      "ing": { blok: true,  gunlukMax: 2, maxGunSayisi: 2},
      "edb": { blok: true,  gunlukMax: 2, maxGunSayisi: 4},
      "alm": { blok: true,  gunlukMax: 2, maxGunSayisi: 2},
      "beden": { blok: true, gunlukMax: 2, maxGunSayisi: 1, izinliZamanlar: { 5: [5, 6, 7, 8]}},
      "tarih":{blok: false,gunlukMax:1},
      "resim":{blok:false}
      
  };

  let tablo = document.getElementById("programTablosu");
  const gunler = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
  const saatler = ["09.00-10.00", "10.00-11.00", "11.00-12.00", "12.00-13.00", "13.00-14.00", "14.00-15.00", "15.00-16.00", "16.00-17.00"];
  
  const satirSayisi = saatler.length + 1; 
  const sutunSayisi = 8;
  
  let ogleArasiHaritasi = [-1,4, 4, 4, 4, 5, -1, -1]; 

  // --- 2. TABLO ÇİZİMİ ---
  for (let i = 0; i < satirSayisi; i++) {
    let tr = document.createElement("tr");
    for (let j = 0; j < sutunSayisi; j++) {
      let td = document.createElement("td");
      td.dataset.row = i;
      td.dataset.col = j;
      
      if (i === 0 && j === 0) { td.classList.add("baslik-hucre"); td.innerText = "Saat/Gün"; }
      else if (i === 0) { td.classList.add("baslik-hucre"); td.innerText = gunler[j-1] || "Ek"; }
      else if (j === 0) { td.classList.add("baslik-hucre"); td.innerText = saatler[i-1] || "--"; td.style.fontSize = "11px"; }
      else if (j > 5 && i > 0) { 
          td.classList.add("kapali-alan");
          td.innerText = "TATİL";
      }
      else if (i === ogleArasiHaritasi[j]) {
          td.classList.add("ogle-arasi");
          td.innerText = "ÖĞLE ARASI";
      }
      else {
        td.setAttribute("ondrop", "birakildi(event)");
        td.setAttribute("ondragover", "izinVer(event)");
      }
      tr.appendChild(td);
    }
    tablo.appendChild(tr);
  }

  // --- YARDIMCI FONKSİYONLAR ---
  function stokGorseliniGuncelle() {
    for (let dersKodu in guncelStoklar) {
        let kalan = guncelStoklar[dersKodu];
        let span = document.getElementById("count-" + dersKodu);
        let anaKutu = document.getElementById(dersKodu);
        
        if(span) span.innerText = "(" + kalan + ")";
        if (kalan <= 0) { 
            anaKutu.classList.add("stok-bitti");
            anaKutu.setAttribute("draggable", "false");
        } else {
            anaKutu.classList.remove("stok-bitti");
            anaKutu.setAttribute("draggable", "true");
        }
    }
  }

  function uyariGoster(mesaj) {
    let kutu = document.getElementById("hataKutusu");
    kutu.innerText = mesaj;
    kutu.style.display = "block";
    setTimeout(function() { kutu.style.display = "none"; }, 3000);
  }

  function kurallariKontrolEt(dersId, hedefCol, hedefRow, koyulacakMiktar) {
      let kural = dersKurallari[dersId];
      if (kural.izinliZamanlar) {
          let izinliSatirlar = kural.izinliZamanlar[hedefCol];
          if (!izinliSatirlar) { uyariGoster(dersId.toUpperCase() + " bu güne koyulamaz!"); return false; }
          let saatIndex = hedefRow - 1; 
          if (!izinliSatirlar.includes(saatIndex)) { uyariGoster(dersId.toUpperCase() + " bu saate koyulamaz!"); return false; }
          if (koyulacakMiktar > 1) {
              let sonrakiSaatIndex = saatIndex + 1;
              if (!izinliSatirlar.includes(sonrakiSaatIndex)) { uyariGoster("Blok dersin ikinci saati yasaklı zamana denk geliyor!"); return false; }
          }
      }
      let oGunkuDersSayisi = 0;
      let tumSatirlar = tablo.rows;
      for(let r=1; r < satirSayisi; r++) {
          let hucre = tumSatirlar[r].cells[hedefCol];
          if(hucre.children.length > 0 && hucre.children[0].dataset.dersId === dersId) { oGunkuDersSayisi++; }
      }
      if (oGunkuDersSayisi + koyulacakMiktar > kural.gunlukMax) { uyariGoster("Günlük limit aşıldı! ("+kural.gunlukMax+" saat)"); return false; }

      if (oGunkuDersSayisi === 0) { 
          var doluGunSayisi = 0;
          for(let c=1; c < sutunSayisi; c++) {
              let buGundeVarMi = false;
              for(let r=1; r < satirSayisi; r++) {
                  let hucre = tumSatirlar[r].cells[c];
                  if(hucre.children.length > 0 && hucre.children[0].dataset.dersId === dersId) { buGundeVarMi = true; break; }
              }
              if(buGundeVarMi) doluGunSayisi++;
          }
          if (doluGunSayisi + 1 > kural.maxGunSayisi) { uyariGoster("Maksimum gün sayısı aşıldı!"); return false; }
      }
      return true;
  }

  function tasimaBasladi(e) {
    let id = e.target.id;
    if (guncelStoklar[id] > 0) e.dataTransfer.setData("text", id);
    else e.preventDefault();
  }
  function izinVer(e) { e.preventDefault(); }

  function birakildi(e) {
    e.preventDefault();
    let dersId = e.dataTransfer.getData("text");
    if (!dersId) return;
    
    let hedefHucre = e.target.tagName === "TD" ? e.target : null;
    
    if (!hedefHucre || hedefHucre.classList.contains("ogle-arasi")) {
        uyariGoster("Öğle arasına ders koyamazsınız!");
        return;
    }

    let hedefRow = parseInt(hedefHucre.dataset.row);
    let hedefCol = parseInt(hedefHucre.dataset.col);

    if (hedefCol > 5) {
        uyariGoster("Hafta sonuna ders konulamaz!");
        return;
    } 
    let kural = dersKurallari[dersId];
    let kalanStok = guncelStoklar[dersId];
    let blokModu = kural.blok && kalanStok >= 2;

    if (blokModu) {
        if (hedefRow >= satirSayisi - 1) { uyariGoster("Blok ders son saate sığmaz!"); return; }
        
        let oGunkuOgleArasi = ogleArasiHaritasi[hedefCol];
        if (hedefRow + 1 === oGunkuOgleArasi) {
            uyariGoster("Blok ders öğle arasıyla bölünemez!");
            return;
        }
        
        let altHucre = tablo.rows[hedefRow + 1].cells[hedefCol];
        if (hedefHucre.children.length > 0 || altHucre.children.length > 0) { uyariGoster("Alt alta 2 saat boş olmalı!"); return; }

        if (!kurallariKontrolEt(dersId, hedefCol, hedefRow, 2)) return;

        let grupId = Date.now();
        yerlestirGorsel(hedefHucre, dersId, grupId);
        yerlestirGorsel(altHucre, dersId, grupId);
        guncelStoklar[dersId] -= 2;
      }
       else {
        if (hedefHucre.children.length > 0) { uyariGoster("Bu saat dolu!"); return; }
        if (!kurallariKontrolEt(dersId, hedefCol, hedefRow, 1)) return;

        let grupId = Date.now();
        yerlestirGorsel(hedefHucre, dersId, grupId);
        guncelStoklar[dersId] -= 1;
    }
    stokGorseliniGuncelle();
  }

  function yerlestirGorsel(hucre, dersId, grupId) {
      let orijinal = document.getElementById(dersId);
      let textSadece = orijinal.querySelector("span").firstChild.textContent;
      let kopya = document.createElement("div");
      kopya.innerText = textSadece;
      kopya.dataset.dersId = dersId;
      kopya.dataset.grupId = grupId;
      kopya.classList.add("yerlesmis-ders");
      kopya.ondblclick = function() { dersiSil(this); };
      hucre.appendChild(kopya);
  }

  function dersiSil(element) {
    let id = element.dataset.dersId;
    let grupId = element.dataset.grupId;
    let kardesler = document.querySelectorAll(`.yerlesmis-ders[data-grup-id='${grupId}']`);
    let iadeMiktari = kardesler.length;
    if (guncelStoklar[id] + iadeMiktari <= baslangicLimitleri[id]) {
        guncelStoklar[id] += iadeMiktari;
        stokGorseliniGuncelle();
    }
    kardesler.forEach(el => el.remove());
  }

  function kaydet() {
    let kayitVerisi = [];
    let tdListesi = tablo.getElementsByTagName("td");
    for (let td of tdListesi) {
        if (td.children.length > 0) {
            let ders = td.children[0];
            kayitVerisi.push({
                row: td.dataset.row,
                col: td.dataset.col,
                dersId: ders.dataset.dersId,
                grupId: ders.dataset.grupId
            });
        }
    }
    localStorage.setItem("dersProgramiV6", JSON.stringify(kayitVerisi));
    alert("Kayıt Başarılı! (Tarayıcı hafızasına alındı)");
  }

  function kodDisaAktar() {
    kaydet(); // Önce son hali kaydet
    let veri = localStorage.getItem("dersProgramiV6");
    if(!veri) { alert("Kaydedilecek veri bulunamadı."); return; }

    let blob = new Blob([veri], {type: "application/json"});
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ders_programi.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- YENİ EKLENEN DOSYA YÜKLEME FONKSİYONLARI ---
  
  // 1. "Yükle" butonuna basınca gizli input'u tetikler
  function dosyaYukleButonu() {
    document.getElementById('gizliDosyaInput').click();
  }

  // 2. Dosya seçilince çalışır
  function dosyaSecildi(event) {
    const dosya = event.target.files[0];
    if (!dosya) return;

    const okuyucu = new FileReader();
    
    // Dosya okuma bitince burası çalışır
    okuyucu.onload = function(e) {
        try {
            const icerik = e.target.result;
            const veriListesi = JSON.parse(icerik); // JSON'ı nesneye çevir
            
            // Eğer veri geçerliyse ekrana bas
            if (Array.isArray(veriListesi)) {
                veriyiEkranaBas(veriListesi); // YENİ: Ortak fonksiyonu çağır
                localStorage.setItem("dersProgramiV6", icerik); // Hafızaya da at
                alert("Ders programı başarıyla yüklendi!");
            } else {
                alert("Hatalı dosya formatı!");
            }
        } catch (error) {
            alert("Dosya okunamadı! Lütfen geçerli bir .json dosyası seçin.");
            console.error(error);
        }
        // Input'u sıfırla ki aynı dosyayı peş peşe seçebilelim
        event.target.value = '';
    };

    okuyucu.readAsText(dosya);
  }

  // --- ORTAK YÜKLEME MANTIĞI (Refactoring) ---
  // Hem sayfa açılınca hem de dosya yükleyince burası çalışır
  function veriyiEkranaBas(veriListesi) {
      // 1. Önce tabloyu ve stokları temizle
      let tumDersler = document.querySelectorAll(".yerlesmis-ders");
      tumDersler.forEach(d => d.remove());
      guncelStoklar = { ...baslangicLimitleri };

      // 2. Yeni verileri yerleştir
      veriListesi.forEach(function(veri) {
          let hedefHucre = tablo.querySelector(`td[data-row='${veri.row}'][data-col='${veri.col}']`);
          if (hedefHucre && !hedefHucre.classList.contains("ogle-arasi")) {
              
              // Stok kontrolü yapmadan direkt koyuyoruz (dosyadan gelene güveniyoruz)
              guncelStoklar[veri.dersId]--;

              let orijinal = document.getElementById(veri.dersId);
              let textSadece = orijinal.querySelector("span").firstChild.textContent;
              let kopya = document.createElement("div");
              kopya.innerText = textSadece;
              kopya.dataset.dersId = veri.dersId;
              kopya.dataset.grupId = veri.grupId;
              kopya.classList.add("yerlesmis-ders");
              kopya.ondblclick = function() { dersiSil(this); };
              hedefHucre.appendChild(kopya);
          }
      });

      // 3. Görsel sayaçları güncelle
      stokGorseliniGuncelle();
  }

  // --- SİSTEM AÇILIRKEN ÇALIŞAN KISIM ---
  function yukle() {
    let kayitliVeri = localStorage.getItem("dersProgramiV6");
    if (!kayitliVeri) { stokGorseliniGuncelle(); return; }
    
    // Var olan veriyi ortak fonksiyona gönder
    let veriListesi = JSON.parse(kayitliVeri);
    veriyiEkranaBas(veriListesi);
  }

  function tabloyuTemizle() {
    if(confirm("Silmek istediğine emin misin?")) {
        localStorage.removeItem("dersProgramiV6");
        location.reload();
    }
  }

  window.onload = function() { yukle(); };