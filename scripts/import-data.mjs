import mysql from 'mysql2/promise';

// Dados dos funcionários extraídos da planilha
const funcionarios = [
  { nome: "ADIRVAL DA SILVA RIBEIRO", cargo: "MOTORISTA DE VAN", tipoContrato: "CLT", cpf: "033.286.309-37", cnhNumero: "03572649008", cnhCategoria: "E", cnhValidade: "2033-06-16" },
  { nome: "ALYSSON RAPHAEL BUSKO", cargo: "MOTORISTA DE VAN", tipoContrato: "CLT", cpf: "049.357.539-19", cnhNumero: "03968854534", cnhCategoria: "AD", cnhValidade: "2031-05-20" },
  { nome: "CAMILA ALVES MARTINS", cargo: "MOTORISTA DE ÔNIBUS", tipoContrato: "CLT", cpf: "320.206.598-08", cnhNumero: "03319775677", cnhCategoria: "AE", cnhValidade: "2033-01-12" },
  { nome: "CARLOS CEZAR DE LIMA", cargo: "MOTORISTA DE VAN", tipoContrato: "CLT", cpf: "608.216.809-78", cnhNumero: "01791094085", cnhCategoria: "D", cnhValidade: "2027-06-08" },
  { nome: "CLAUDIO DOS SANTOS", cargo: "MOTORISTA DE VAN", tipoContrato: "CLT", cpf: "529.630.809-30", cnhNumero: "03228998590", cnhCategoria: "D", cnhValidade: "2028-05-29" },
  { nome: "CLEVERSON DA LUZ", cargo: "MOTORISTA DE VAN", tipoContrato: "PJ", cpf: "078.726.419-92", cnhNumero: "06300279287", cnhCategoria: "D", cnhValidade: "2031-05-10" },
  { nome: "DIOGO MACEDO DA SILVA", cargo: "MOTORISTA DE VAN", tipoContrato: "CLT", cpf: "067.531.209-47", cnhNumero: "04870292156", cnhCategoria: "AD", cnhValidade: "2035-06-10" },
  { nome: "EZEQUIEL PAZ", cargo: "MOTORISTA DE MICRO", tipoContrato: "CLT", cpf: "045.719.209-70", cnhNumero: "04356274076", cnhCategoria: "D", cnhValidade: "2029-12-16" },
  { nome: "FLAVIO SOUSA DA SILVA", cargo: "MOTORISTA DE VAN", tipoContrato: "CLT", cpf: "054.642.919-03", cnhNumero: "04441780311", cnhCategoria: "AD", cnhValidade: "2026-04-05" },
  { nome: "GEISON OSCAR MIKA", cargo: "PINTOR", tipoContrato: "PJ", cpf: "064.448.859-06", cnhNumero: "05413891309", cnhCategoria: "AB", cnhValidade: "2033-07-24" },
  { nome: "GERALDO BORGES MOREIRA FILHO", cargo: "GERENTE OPERAÇÃO", tipoContrato: "PJ", cpf: "655.103.059-91", cnhNumero: "01069621116", cnhCategoria: "AD", cnhValidade: "2028-09-26" },
  { nome: "GERALDO MAURILIO ARAUJO", cargo: "MOTORISTA DE MICRO", tipoContrato: "CLT", cpf: "648.916.239-34", cnhNumero: "00349188688", cnhCategoria: "AD", cnhValidade: "2027-04-06" },
  { nome: "GILBERTO MARQUES", cargo: "MOTORISTA DE ÔNIBUS", tipoContrato: "CLT", cpf: "488.873.669-34", cnhNumero: "02756610647", cnhCategoria: "AE", cnhValidade: "2028-04-18" },
  { nome: "JACIR JOSE FAVETTI", cargo: "MOTORISTA DE ÔNIBUS", tipoContrato: "CLT", cpf: "675.164.409-49", cnhNumero: "01562257718", cnhCategoria: "E", cnhValidade: "2030-03-05" },
  { nome: "JEFERSON YUKIO MINAMIDA", cargo: "MECÂNICO AUTOMOTIVO", tipoContrato: "CLT", cpf: "080.936.049-79", cnhNumero: "04768465031", cnhCategoria: "AD", cnhValidade: "2031-07-01" },
  { nome: "JOÃO BATISTA GONÇALVES", cargo: "MOTORISTA DE VAN", tipoContrato: "CLT", cpf: "005.291.359-73", cnhNumero: "01962041984", cnhCategoria: "AE", cnhValidade: "2034-11-13" },
  { nome: "JOÃO CARLOS CRUCINSKY", cargo: "MOTORISTA DE VAN", tipoContrato: "PJ", cpf: "186.268.669-68", cnhNumero: "01056017300", cnhCategoria: "E", cnhValidade: "2026-06-10" },
  { nome: "JORGE RENATO DE ARAUJO", cargo: "MOTORISTA DE VAN", tipoContrato: "PJ", cpf: "410.078.599-20", cnhNumero: "00375458698", cnhCategoria: "AD", cnhValidade: "2026-06-02" },
  { nome: "JOSE FRANCISCO RAMOS DE LIMA", cargo: "MOTORISTA DE VAN", tipoContrato: "CLT", cpf: "664.331.189-68", cnhNumero: "02156569290", cnhCategoria: "D", cnhValidade: "2028-04-03" },
  { nome: "JOSE LUIZ ITENA", cargo: "MOTORISTA DE ÔNIBUS", tipoContrato: "CLT", cpf: "599.478.619-53", cnhNumero: "01133315301", cnhCategoria: "E", cnhValidade: "2030-10-10" },
  { nome: "LUIZ CARLOS CAMARGO", cargo: "MOTORISTA DE ÔNIBUS", tipoContrato: "CLT", cpf: "371.274.709-87", cnhNumero: "01682328002", cnhCategoria: "D", cnhValidade: "2026-04-06" },
  { nome: "MARCELO MEDEIROS", cargo: "MOTORISTA DE VAN", tipoContrato: "CLT", cpf: "924.639.089-04", cnhNumero: "01820242563", cnhCategoria: "D", cnhValidade: "2030-02-14" },
  { nome: "MARCO ANTONIO ROTES", cargo: "MOTORISTA DE VAN", tipoContrato: "PJ", cpf: "676.831.509-91", cnhNumero: "01369481534", cnhCategoria: "AD", cnhValidade: "2028-10-31" },
  { nome: "MILTON SIRIS RAMOS CABRERA FILHO", cargo: "MOTORISTA DE ÔNIBUS", tipoContrato: "CLT", cpf: "007.195.559-30", cnhNumero: "00869197500", cnhCategoria: "E", cnhValidade: "2035-01-15" },
  { nome: "MIRIAN DECOL DOS SANTOS", cargo: "MOTORISTA DE VAN", tipoContrato: "CLT", cpf: "024.955.169-12", cnhNumero: "05108409990", cnhCategoria: "E", cnhValidade: "2035-07-02" },
  { nome: "MIRIAN EVANGELISTA FERREIRA", cargo: "MOTORISTA DE VAN", tipoContrato: "CLT", cpf: "034.213.789-16", cnhNumero: "03664670462", cnhCategoria: "AD", cnhValidade: "2026-01-07" },
  { nome: "MOISES PEREIRA DE VILAS BOAS", cargo: "MOTORISTA DE VAN", tipoContrato: "CLT", cpf: "397.071.318-88", cnhNumero: "07209850742", cnhCategoria: "AD", cnhValidade: "2034-12-17" },
  { nome: "OTAVIO DRESCH MARTINS", cargo: "AUX. ADMINISTRATIVO", tipoContrato: "CLT", cpf: "126.316.529-08", cnhNumero: "07975828107", cnhCategoria: "AB", cnhValidade: "2032-05-30" },
  { nome: "RELBERTH ROSA E SILVA", cargo: "COORDENADOR ADM.", tipoContrato: "PJ", cpf: "960.178.219-20", cnhNumero: "01981291950", cnhCategoria: "AD", cnhValidade: "2035-05-20" },
  { nome: "RICARDO SYPCZUK", cargo: "MANOBR. ABASTECEDOR", tipoContrato: "CLT", cpf: "038.124.279-07", cnhNumero: "01570474311", cnhCategoria: "AD", cnhValidade: "2035-03-18" },
  { nome: "RODRIGO DRESCH BUENO", cargo: "DIRETOR", tipoContrato: "PJ", cpf: "022.599.069-58", cnhNumero: "02641284501", cnhCategoria: "AD", cnhValidade: "2034-10-10" },
  { nome: "ROSA CLEIDE DE LIMA RAMOS", cargo: "MOTORISTA DE VAN", tipoContrato: "CLT", cpf: "117.421.748-09", cnhNumero: "00446153631", cnhCategoria: "AD", cnhValidade: "2028-11-06" },
  { nome: "SERGIO ALVES MARTINS", cargo: "SÓCIO", tipoContrato: "PJ", cpf: "022.229.009-99", cnhNumero: "00528254412", cnhCategoria: "AB", cnhValidade: "2028-06-26" },
  { nome: "SIGFRIED SCHADE", cargo: "MOTORISTA DE VAN", tipoContrato: "PJ", cpf: "491.966.189-49", cnhNumero: "00806351380", cnhCategoria: "D", cnhValidade: "2029-04-15" },
  { nome: "VANDERLEI ROBERTO ROSA", cargo: "MOTORISTA DE VAN", tipoContrato: "CLT", cpf: "917.083.629-91", cnhNumero: "03591101699", cnhCategoria: "D", cnhValidade: "2032-06-28" },
  { nome: "WILSON DALMORA", cargo: "MOTORISTA DE ÔNIBUS", tipoContrato: "CLT", cpf: "085.439.569-51", cnhNumero: "05748474005", cnhCategoria: "AD", cnhValidade: "2033-12-06" },
];

// Dados dos veículos extraídos da planilha
const veiculos = [
  { modelo: "SPRINTER 415", frota: "06", ano: 2016, placa: "AZS-9G06", renavam: "01054930519", chassi: "8AC906633GE108423", tipo: "van" },
  { modelo: "SPRINTER 415", frota: "07", ano: 2012, placa: "AXM-9548", renavam: "585415919", chassi: "8AC906633DE069663", tipo: "van" },
  { modelo: "SPRINTER 416", frota: "08", ano: 2020, placa: "ENN-4H07", renavam: "1220631288", chassi: "8AC907843LE183002", tipo: "van" },
  { modelo: "SPRINTER 415", frota: "09", ano: 2016, placa: "BAH-0757", renavam: "1077249842", chassi: "8AC906635GE114024", tipo: "van" },
  { modelo: "TRANSIT", frota: "10", ano: 2011, placa: "AVH-0D49", renavam: "00462257738", chassi: "WF0XXXTBFBTJ34144", tipo: "van" },
  { modelo: "SPRINTER 416", frota: "14", ano: 2022, placa: "SDZ-6D16", renavam: "01327478860", chassi: "8AC907645NE220597", tipo: "van" },
  { modelo: "SPRINTER 415", frota: "16", ano: 2016, placa: "BBC-9042", renavam: "1109303499", chassi: "8AC906635HE126284", tipo: "van" },
  { modelo: "SPRINTER 515", frota: "17", ano: 2014, placa: "FSH-0I83", renavam: "1045189895", chassi: "8AC906655EE090554", tipo: "van" },
  { modelo: "SPRINTER 415", frota: "18", ano: 2013, placa: "EVO-3390", renavam: "657371130", chassi: "8AC906635DE082133", tipo: "van" },
  { modelo: "TRANSIT", frota: "19", ano: 2022, placa: "SDS-6H44", renavam: "1315505301", chassi: "WF0JTTBE8NU001531", tipo: "van" },
  { modelo: "SPRINTER 415", frota: "20", ano: 2018, placa: "BBY-1A59", renavam: "1143024785", chassi: "8AC906633JE147181", tipo: "van" },
  { modelo: "SPRINTER 415", frota: "21", ano: 2019, placa: "QQK-8E34", renavam: "1186406094", chassi: "8AC906633KE166553", tipo: "van" },
  { modelo: "SPRINTER 415", frota: "22", ano: 2019, placa: "QQG-1F39", renavam: "1183691383", chassi: "8AC906633KE166550", tipo: "van" },
  { modelo: "SPRINTER 416", frota: "23", ano: 2020, placa: "QXR-5F17", renavam: "01224560660", chassi: "8AC907843LE184330", tipo: "van" },
  { modelo: "SPRINTER 416", frota: "25", ano: 2022, placa: "SDY-3G44", renavam: "01325908476", chassi: "8AC907843NE221343", tipo: "van" },
  { modelo: "SPRINTER 417", frota: "26", ano: 2025, placa: "TAU-9J70", renavam: "01406528509", chassi: "8AC907843SE247528", tipo: "van" },
  { modelo: "SPRINTER 417", frota: "27", ano: 2025, placa: "TAU-9J73", renavam: "01416615595", chassi: "8AC907843SE255082", tipo: "van" },
  { modelo: "SPRINTER 416", frota: "30", ano: 2022, placa: "SDY-3G33", renavam: "01325900254", chassi: "8AC907843NE222047", tipo: "van" },
  { modelo: "SPRINTER 416", frota: "31", ano: 2022, placa: "SDY-3G52", renavam: "01325899795", chassi: "8AC907843NE222132", tipo: "van" },
  { modelo: "SPRINTER 416", frota: "32", ano: 2022, placa: "SDY-3G46", renavam: "01325903024", chassi: "8AC907843NE222642", tipo: "van" },
  { modelo: "SPRINTER 416", frota: "33", ano: 2022, placa: "SEE-1D79", renavam: "01334636009", chassi: "8AC907843NE225951", tipo: "van" },
  { modelo: "SPRINTER 417", frota: "34", ano: 2025, placa: "TBA-2E34", renavam: "01434341760", chassi: "8AC907843SE253871", tipo: "van" },
  { modelo: "SPRINTER 417", frota: "35", ano: 2025, placa: "TBE-3J36", renavam: "01430916980", chassi: "8AC907843SE258300", tipo: "van" },
  { modelo: "SPRINTER 417", frota: "50", ano: 2025, placa: "TBE-3J20", renavam: "1430916998", chassi: "8AC907857SE255896", tipo: "van" },
  { modelo: "MICRO SENIOR", frota: "500", ano: 2011, placa: "ATU-5643", renavam: "00309980690", chassi: "9532A52R5BR133135", tipo: "micro-onibus" },
  { modelo: "MICRO NEOBUS", frota: "510", ano: 2003, placa: "JOZ-5I89", renavam: "00794976417", chassi: "9BYC22K1S3C002321", tipo: "micro-onibus" },
  { modelo: "VOLARE W8", frota: "520", ano: 2005, placa: "AMR-9575", renavam: "00853668612", chassi: "93PB12E3P5C015627", tipo: "micro-onibus" },
  { modelo: "VOLARE W8", frota: "530", ano: 2005, placa: "AMR-9571", renavam: "00853670285", chassi: "93PB12E3P5CO15613", tipo: "micro-onibus" },
  { modelo: "VOLARE V8L ON", frota: "2301", ano: 2023, placa: "SEU-5A72", renavam: "01359987832", chassi: "93PB43A32PC071113", tipo: "micro-onibus" },
  { modelo: "VOLARE V8L ON", frota: "2302", ano: 2023, placa: "SEU-5A70", renavam: "", chassi: "", tipo: "micro-onibus" },
  { modelo: "VW/NEOBUS THANDER+", frota: "555", ano: 2019, placa: "BEZ-4I20", renavam: "01157978212", chassi: "9532M62P7KR906635", tipo: "micro-onibus" },
  { modelo: "MARCOPOLO IDEALE 770", frota: "110", ano: 2010, placa: "ATA-0G27", renavam: "00233704671", chassi: "9532L82W1AR049393", tipo: "onibus" },
  { modelo: "MARCOPOLO IDEALE 770", frota: "120", ano: 2011, placa: "BEZ-1134", renavam: "00281309590", chassi: "9532L82W7BR121182", tipo: "onibus" },
  { modelo: "MARCOPOLO IDEALE 770", frota: "130", ano: 2010, placa: "ASQ-6H69", renavam: "00212201182", chassi: "9532L82W3AR036743", tipo: "onibus" },
  { modelo: "COMIL VERSATILE", frota: "140", ano: 2012, placa: "AUW-8G70", renavam: "00418905690", chassi: "9532L82W5CR223176", tipo: "onibus" },
  { modelo: "VOLVO/COMIL CAMPIONE R 3.45", frota: "1100", ano: 2012, placa: "BEZ-1C86", renavam: "00527832510", chassi: "9BVR6R20CE359837", tipo: "onibus" },
  { modelo: "M.BENZ/COMIL VERSATILE", frota: "1501", ano: 2015, placa: "QIJ-1905", renavam: "10035786050", chassi: "9BM384067FB974714", tipo: "onibus" },
  { modelo: "M.BENZ/COMIL VERSATILE", frota: "1502", ano: 2015, placa: "QIE-1905", renavam: "01035775449", chassi: "9BM384067FB974727", tipo: "onibus" },
  { modelo: "SCANIA/MPOLO DD 1800", frota: "3000", ano: 2011, placa: "AUL-1I41", renavam: "00345609611", chassi: "9BSK6X200B3682894", tipo: "onibus" },
  { modelo: "VOLVO/COMIL CAMPIONE DD", frota: "3300", ano: 2021, placa: "GGH-1D48", renavam: "1243430653", chassi: "9BVT2S921ME390214", tipo: "onibus" },
  { modelo: "VOLVO/MPOLO 1200", frota: "1210", ano: 2001, placa: "LNO-6H42", renavam: "00768478294", chassi: "9BVR6C4101E356873", tipo: "onibus" },
  { modelo: "VOLVO G7 900", frota: "220", ano: 2015, placa: "PJV-5728", renavam: "1081609327", chassi: "9BVT5T728FE403205", tipo: "onibus" },
  { modelo: "VOLVO G7 900", frota: "230", ano: 2015, placa: "PJV-3864", renavam: "1081614169", chassi: "9BVT5T726FE403204", tipo: "onibus" },
];

async function importData() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('Iniciando importação...');
  
  // Importar funcionários
  console.log('\\nImportando funcionários...');
  let funcImportados = 0;
  for (const func of funcionarios) {
    try {
      // Verificar se já existe
      const [existing] = await connection.execute(
        'SELECT id FROM funcionarios WHERE cpf = ?',
        [func.cpf]
      );
      
      if (existing.length > 0) {
        // Atualizar
        await connection.execute(
          `UPDATE funcionarios SET 
            nome = ?, cargo = ?, tipo_contrato = ?, 
            cnh_numero = ?, cnh_categoria = ?, cnh_validade = ?
          WHERE cpf = ?`,
          [func.nome, func.cargo, func.tipoContrato, func.cnhNumero, func.cnhCategoria, func.cnhValidade, func.cpf]
        );
        console.log(`  Atualizado: ${func.nome}`);
      } else {
        // Inserir
        await connection.execute(
          `INSERT INTO funcionarios (nome, cpf, cargo, tipo_contrato, cnh_numero, cnh_categoria, cnh_validade, data_admissao, salario_base, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), 0, 'ativo')`,
          [func.nome, func.cpf, func.cargo, func.tipoContrato, func.cnhNumero, func.cnhCategoria, func.cnhValidade]
        );
        console.log(`  Inserido: ${func.nome}`);
      }
      funcImportados++;
    } catch (error) {
      console.error(`  Erro em ${func.nome}: ${error.message}`);
    }
  }
  
  // Importar veículos
  console.log('\\nImportando veículos...');
  let veicImportados = 0;
  for (const v of veiculos) {
    try {
      // Verificar se já existe
      const [existing] = await connection.execute(
        'SELECT id FROM vehicles WHERE plate = ?',
        [v.placa]
      );
      
      if (existing.length > 0) {
        // Atualizar
        await connection.execute(
          `UPDATE vehicles SET 
            model = ?, year = ?, renavam = ?, chassis = ?, type = ?
          WHERE plate = ?`,
          [v.modelo, v.ano, v.renavam, v.chassi, v.tipo, v.placa]
        );
        console.log(`  Atualizado: ${v.modelo} (${v.placa})`);
      } else {
        // Inserir
        await connection.execute(
          `INSERT INTO vehicles (plate, model, year, renavam, chassis, type, brand, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'ativo')`,
          [v.placa, v.modelo, v.ano, v.renavam, v.chassi, v.tipo, v.modelo.split(' ')[0]]
        );
        console.log(`  Inserido: ${v.modelo} (${v.placa})`);
      }
      veicImportados++;
    } catch (error) {
      console.error(`  Erro em ${v.placa}: ${error.message}`);
    }
  }
  
  console.log('\\n========================================');
  console.log(`Funcionários importados: ${funcImportados}/${funcionarios.length}`);
  console.log(`Veículos importados: ${veicImportados}/${veiculos.length}`);
  console.log('========================================');
  
  await connection.end();
}

importData().catch(console.error);
