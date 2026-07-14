// ========== GERAÇÃO DE ID ÚNICO ==========
function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ========== CARREGAR PACIENTES DO JSON ==========
async function carregarPacientes() {
    try {
        const resposta = await fetch('pacientes.json');
        const dados = await resposta.json();
        return dados.pacientes || [];
    } catch (erro) {
        console.error('Erro ao carregar pacientes:', erro);
        return [];
    }
}

// ========== SALVAR PACIENTES NO JSON ==========
async function salvarPacientes(pacientes) {
    try {
        const dados = { pacientes: pacientes };
        // Aqui você precisaria de um backend (ex: Node.js) para salvar no servidor
        // Por enquanto, vamos salvar no localStorage (só pra testes)
        localStorage.setItem('pacientes', JSON.stringify(dados));
        console.log('Pacientes salvos no localStorage');
        return true;
    } catch (erro) {
        console.error('Erro ao salvar pacientes:', erro);
        return false;
    }
}

// ========== CARREGAR DO LOCALSTORAGE (pra testes) ==========
function carregarDoLocalStorage() {
    const dados = localStorage.getItem('pacientes');
    if (dados) {
        return JSON.parse(dados).pacientes || [];
    }
    return [];
}

// ========== CADASTRO ==========
document.addEventListener('DOMContentLoaded', function() {
    // Página de cadastro
    const formCadastro = document.getElementById('form-cadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nome = document.getElementById('nome').value.trim();
            const cpf = document.getElementById('cpf').value.replace(/[.-]/g, '');
            const dataNasc = document.getElementById('dataNascimento').value;
            const sexo = document.getElementById('sexo').value;
            const endereco = document.getElementById('endereco').value.trim();
            const telefone = document.getElementById('telefone').value.trim();
            const ultimaConsulta = document.getElementById('ultimaConsulta').value;
            const ubs = document.getElementById('ubs').value.trim();
            const equipe = document.getElementById('equipe').value.trim();
            const acs = document.getElementById('acs').value.trim();
            
            const erro = document.getElementById('mensagem-erro');
            const carregando = document.getElementById('mensagem-carregando');
            
            // Validações
            if (!nome || !cpf || !endereco || !ubs || !equipe) {
                erro.style.display = 'block';
                erro.textContent = '⚠️ Preencha todos os campos com *';
                return;
            }
            
            if (cpf.length !== 11) {
                erro.style.display = 'block';
                erro.textContent = '⚠️ CPF inválido (deve ter 11 dígitos)';
                return;
            }
            
            erro.style.display = 'none';
            carregando.style.display = 'block';
            
            // Calcula idade
            let idade = '';
            if (dataNasc) {
                const nasc = new Date(dataNasc);
                const hoje = new Date();
                let anos = hoje.getFullYear() - nasc.getFullYear();
                const mes = hoje.getMonth() - nasc.getMonth();
                if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
                    anos--;
                }
                idade = anos + ' anos';
            }
            
            // Cria o paciente
            const novoPaciente = {
                id: gerarId(),
                nome: nome,
                cpf: cpf,
                senha: cpf.slice(-4),
                dataNasc: dataNasc,
                sexo: sexo,
                idade: idade,
                endereco: endereco,
                telefone: telefone,
                ultimaConsulta: ultimaConsulta,
                ubs: ubs || 'UBS FIOFO DO JUDAS',
                equipe: equipe || 'ESF 168',
                acs: acs || 'Maria (sua irmã)',
                foto: '',
                consultas: []
            };
            
            // Carrega pacientes existentes
            let pacientes = carregarDoLocalStorage();
            pacientes.push(novoPaciente);
            
            // Salva
            const salvou = await salvarPacientes(pacientes);
            
            carregando.style.display = 'none';
            
            if (!salvou) {
                erro.style.display = 'block';
                erro.textContent = '❌ Erro ao salvar. Tente novamente.';
                return;
            }
            
            // Salva o ID e redireciona
            localStorage.setItem('pacienteId', novoPaciente.id);
            alert('✅ Cartão criado com sucesso! Sua senha é: ' + novoPaciente.senha);
            window.location.href = 'cartao.html';
        });
    }
    
    // ========== ACESSO POR SENHA ==========
    const formSenha = document.getElementById('form-senha');
    if (formSenha) {
        formSenha.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const senha = document.getElementById('senha').value;
            const erro = document.getElementById('mensagem-erro');
            
            if (senha.length !== 4) {
                erro.style.display = 'block';
                erro.textContent = '❌ Digite 4 dígitos';
                return;
            }
            
            erro.style.display = 'none';
            
            // Busca no localStorage
            const pacientes = carregarDoLocalStorage();
            const paciente = pacientes.find(p => p.senha === senha);
            
            if (!paciente) {
                erro.style.display = 'block';
                erro.textContent = '❌ Senha incorreta. Tente novamente.';
                return;
            }
            
            localStorage.setItem('pacienteId', paciente.id);
            window.location.href = 'cartao.html';
        });
    }
    
    // ========== CARREGAR CARTÃO ==========
    const pacienteId = localStorage.getItem('pacienteId');
    if (pacienteId && document.querySelector('.cartao')) {
        const pacientes = carregarDoLocalStorage();
        const paciente = pacientes.find(p => p.id === pacienteId);
        
        if (!paciente) {
            alert('Cartão não encontrado. Faça login novamente.');
            localStorage.removeItem('pacienteId');
            window.location.href = 'acessar.html';
            return;
        }
        
        // Preenche os campos
        document.getElementById('ubs').textContent = paciente.ubs || 'UBS FIOFO DO JUDAS';
        document.getElementById('equipe').textContent = paciente.equipe || 'ESF 168';
        document.getElementById('nome').textContent = paciente.nome || '---';
        document.getElementById('cpf').textContent = paciente.cpf || '---';
        document.getElementById('endereco').textContent = paciente.endereco || '---';
        document.getElementById('telefone').textContent = paciente.telefone || '---';
        document.getElementById('acs').textContent = paciente.acs || '---';
        
        // Sexo + idade
        let sexoIdade = '';
        if (paciente.sexo) sexoIdade += paciente.sexo;
        if (paciente.idade) sexoIdade += ' - ' + paciente.idade;
        document.getElementById('sexoIdade').textContent = sexoIdade || '---';
        
        // Última consulta
        if (paciente.ultimaConsulta) {
            const data = new Date(paciente.ultimaConsulta);
            document.getElementById('ultimaConsulta').textContent = data.toLocaleDateString('pt-BR');
        }
    }
});