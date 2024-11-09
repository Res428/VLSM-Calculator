// Hàm chuyển CIDR sang subnet mask thập phân
function cidrToSubnetMask(cidr) {
  let mask = (0xffffffff << (32 - cidr)) >>> 0;
  return [mask >>> 24, (mask >> 16) & 255, (mask >> 8) & 255, mask & 255].join(
    "."
  );
}

// Hàm chuyển đổi IP sang số nguyên
function ipToNumber(ip) {
  return ip
    .split(".")
    .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);
}

// Hàm chuyển số nguyên sang IP
function numberToIp(number) {
  return [
    (number >>> 24) & 255,
    (number >> 16) & 255,
    (number >> 8) & 255,
    number & 255,
  ].join(".");
}

// Hàm tính toán VLSM cho các subnet
function calculateVLSM(ipAddress, cidr, subnetSizes) {
  const results = [];
  let baseIp = ipToNumber(ipAddress);

  // Sắp xếp các subnet theo số hosts yêu cầu giảm dần
  subnetSizes.sort((a, b) => b - a);

  for (let i = 0; i < subnetSizes.length; i++) {
    let requiredHosts = subnetSizes[i];
    let subnetBits = Math.ceil(Math.log2(requiredHosts + 2)); // Thêm 2 để có địa chỉ mạng và broadcast
    let newCidr = 32 - subnetBits;
    let hostsPerSubnet = Math.pow(2, subnetBits) - 2;
    let subnetId = baseIp;
    let firstIp = subnetId + 1;
    let lastIp = subnetId + hostsPerSubnet;
    let broadcast = lastIp + 1;

    results.push({
      id: `Subnet ${i + 1}`,
      networkAddress: numberToIp(subnetId),
      slash: `/${newCidr}`,
      mask: cidrToSubnetMask(newCidr),
      firstIp: numberToIp(firstIp),
      lastIp: numberToIp(lastIp),
      broadcast: numberToIp(broadcast),
      hostCount: hostsPerSubnet,
    });

    // Cập nhật IP cơ sở cho subnet tiếp theo
    baseIp = broadcast + 1;
  }
  return results;
}

// Xử lý sự kiện khi submit form
document
  .getElementById("vlsmForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const ipAddress = document.getElementById("ipAddress").value;
    const subnetMask = parseInt(document.getElementById("subnetMask").value);
    const subnetSizes = document
      .getElementById("subnetSizes")
      .value.split(",")
      .map((size) => parseInt(size.trim()))
      .filter((size) => !isNaN(size) && size > 0);

    const results = calculateVLSM(ipAddress, subnetMask, subnetSizes);
    displayResults(results);
  });

// Hàm hiển thị kết quả ra bảng
function displayResults(results) {
  const resultsBody = document.getElementById("resultsBody");
  resultsBody.innerHTML = ""; // Xóa nội dung cũ

  results.forEach((result) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${result.id}</td>
        <td>${result.networkAddress}</td>
        <td>${result.slash}</td>
        <td>${result.mask}</td>
        <td style="
            height: 62px;
            width: 212px;
        ">${result.firstIp} - ${result.lastIp}</td>
        <td>${result.broadcast}</td>
        <td>${result.hostCount}</td>
      `;
    resultsBody.appendChild(row);
  });
}
