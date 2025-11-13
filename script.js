document.getElementById("fileInput").addEventListener("change", handleFiles);

function handleFiles(event) {
  const files = event.target.files;
  const fileList = document.getElementById("fileList");
  fileList.innerHTML = "";

  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target.result.trim();
      const numbers = content.split(/\r?\n/).filter(line => line.trim() !== "");
      const count = numbers.length;

      const card = document.createElement("div");
      card.className = "file-card";
      card.innerHTML = `
        <div class="file-header">${file.name}</div>
        <div class="file-info">Jumlah kontak: <b>${count}</b></div>

        <label class="label">Nama Kontak (CTC)</label>
        <input type="text" placeholder="Nama kontak (opsional)" class="ctcName">

        <label class="label">Nama File</label>
        <input type="text" placeholder="Nama file (opsional)" class="fileName">

        <textarea class="numbersBox">${numbers.join("\n")}</textarea>
        <button class="downloadBtn">Download VCF</button>
      `;

      fileList.appendChild(card);

      const btn = card.querySelector(".downloadBtn");
      btn.addEventListener("click", () => {
        const ctcName = card.querySelector(".ctcName").value.trim();
        const customFile = card.querySelector(".fileName").value.trim();
        const text = card.querySelector(".numbersBox").value.trim();
        const editedNumbers = text.split(/\r?\n/).filter(line => line.trim() !== "");
        const vcfContent = generateVCF(editedNumbers, ctcName || file.name.replace(".txt", ""));
        const blob = new Blob([vcfContent], { type: "text/vcard;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = (customFile || file.name.replace(".txt", "")) + ".vcf";
        link.click();
      });
    };
    reader.readAsText(file);
  });
}

function generateVCF(numbers, ctcName) {
  let vcf = "";
  const { prefix, startNumber } = detectNumericSuffix(ctcName);

  numbers.forEach((num, index) => {
    let contactName;
    if (startNumber !== null) {
      contactName = prefix + (startNumber + index);
    } else {
      contactName = `${ctcName} ${index + 1}`;
    }

    const cleanNum = formatPhone(num);

    vcf += `BEGIN:VCARD
VERSION:3.0
FN:${contactName}
TEL;TYPE=CELL:${cleanNum}
END:VCARD
`;
  });

  return vcf;
}

function detectNumericSuffix(name) {
  const match = name.match(/(.*?)(\d+)$/);
  if (match) {
    return { prefix: match[1], startNumber: parseInt(match[2], 10) };
  } else {
    return { prefix: name + " ", startNumber: null };
  }
}

function formatPhone(num) {
  let n = num.replace(/[^\d+]/g, "");
  if (!n.startsWith("+") && !n.startsWith("0")) {
    n = "+" + n;
  }
  return n;
}
