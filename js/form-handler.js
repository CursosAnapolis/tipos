// Manipulador de formulários para envio ao Discord
document.addEventListener('DOMContentLoaded', function() {
    const formulariosCadastro = document.querySelectorAll('form[id^="form-cadastro"]');
    
    formulariosCadastro.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar formulário antes de enviar
            if (!validarFormulario(this)) {
                return;
            }
            
            // Coletar dados do formulário
            const formData = new FormData(this);
            const dados = {};
            
            for (const [key, value] of formData.entries()) {
                dados[key] = value;
            }
            
            // Adicionar informações adicionais
            dados.curso = this.getAttribute('data-curso');
            dados.dataInscricao = new Date().toLocaleString('pt-BR');
            dados.pagina = window.location.href;
            
            // Enviar para o webhook do Discord
            enviarParaDiscord(dados, this);
        });
    });
    
    function validarFormulario(formulario) {
        const camposObrigatorios = formulario.querySelectorAll('[required]');
        let valido = true;
        
        camposObrigatorios.forEach(campo => {
            if (!campo.value.trim()) {
                campo.style.borderColor = '#f44336';
                valido = false;
                
                // Remover o estilo de erro quando o usuário começar a digitar
                campo.addEventListener('input', function() {
                    this.style.borderColor = '#ddd';
                });
            }
        });
        
        // Validar CPF (formato básico)
        const cpf = formulario.querySelector('input[name="cpf"]');
        if (cpf && cpf.value) {
            const cpfLimpo = cpf.value.replace(/\D/g, '');
            if (cpfLimpo.length !== 11) {
                alert('Por favor, insira um CPF válido com 11 dígitos.');
                cpf.style.borderColor = '#f44336';
                cpf.focus();
                valido = false;
            }
        }
        
        // Validar e-mail
        const email = formulario.querySelector('input[type="email"]');
        if (email && email.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value)) {
                alert('Por favor, insira um e-mail válido.');
                email.style.borderColor = '#f44336';
                email.focus();
                valido = false;
            }
        }
        
        return valido;
    }
    
    function enviarParaDiscord(dados, formulario) {
        const webhookURL = 'https://discord.com/api/webhooks/1430258829165199490/6t1fJXseq3PRqZ6n1n05olNazwiSts39YUsAxEVjrPsZesfsGUfrcSgFsdORyI3cMod6';
        
        // Formatar mensagem para o Discord
        const mensagem = {
            content: '🎓 Nova inscrição recebida!',
            embeds: [{
                title: `Inscrição no curso: ${dados.curso}`,
                color: 0x8A2BE2,
                fields: [
                    {
                        name: '👤 Nome',
                        value: dados.nome || 'Não informado',
                        inline: true
                    },
                    {
                        name: '🎂 Idade',
                        value: dados.idade || 'Não informado',
                        inline: true
                    },
                    {
                        name: '📄 CPF',
                        value: dados.cpf || 'Não informado',
                        inline: true
                    },
                    {
                        name: '👩 Nome da Mãe',
                        value: dados.mae || 'Não informado',
                        inline: true
                    },
                    {
                        name: '👨 Nome do Pai',
                        value: dados.pai || 'Não informado',
                        inline: true
                    },
                    {
                        name: '📧 E-mail',
                        value: dados.email || 'Não informado',
                        inline: true
                    },
                    {
                        name: '📞 Telefone',
                        value: dados.telefone || 'Não informado',
                        inline: true
                    },
                    {
                        name: '📅 Data da Inscrição',
                        value: dados.dataInscricao,
                        inline: true
                    },
                    {
                        name: '🌐 Página',
                        value: dados.pagina || 'Não informado',
                        inline: true
                    }
                ],
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'Cursos Anápolis - Sistema de Inscrições'
                }
            }]
        };
        
        // Alterar estado do botão
        const botao = formulario.querySelector('button[type="submit"]');
        const textoOriginal = botao.textContent;
        
        botao.innerHTML = '<div class="loading"></div> Enviando...';
        botao.disabled = true;
        
        // Fazer a requisição para o webhook
        fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mensagem)
        })
        .then(response => {
            if (response.ok) {
                // Sucesso - redirecionar para página de agradecimento
                botao.textContent = '✅ Inscrição Concluída!';
                botao.classList.add('form-success');
                
                setTimeout(() => {
                    // Redirecionar para a página de agradecimento
                    const basePath = window.location.pathname.includes('/pages/') ? '..' : '.';
                    window.location.href = `${basePath}/pages/obrigado.html`;
                }, 1500);
            } else {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
        })
        .catch(error => {
            console.error('Erro ao enviar para Discord:', error);
            botao.textContent = '❌ Erro ao enviar. Tente novamente.';
            botao.classList.add('form-error');
            
            // Tentar salvar localmente como fallback
            salvarLocalmente(dados);
            
            setTimeout(() => {
                botao.textContent = textoOriginal;
                botao.disabled = false;
                botao.classList.remove('form-error');
            }, 3000);
        });
    }
    
    // Fallback: salvar dados localmente se o webhook falhar
    function salvarLocalmente(dados) {
        try {
            const inscricoes = JSON.parse(localStorage.getItem('inscricoes_pendentes') || '[]');
            inscricoes.push({
                ...dados,
                timestamp: new Date().toISOString(),
                enviado: false
            });
            localStorage.setItem('inscricoes_pendentes', JSON.stringify(inscricoes));
            console.log('Inscrição salva localmente para envio posterior.');
        } catch (error) {
            console.error('Erro ao salvar localmente:', error);
        }
    }
    
    // Tentar reenviar inscrições pendentes quando online
    function tentarReenviarPendentes() {
        try {
            const inscricoes = JSON.parse(localStorage.getItem('inscricoes_pendentes') || '[]');
            if (inscricoes.length > 0 && navigator.onLine) {
                console.log(`Tentando reenviar ${inscricoes.length} inscrição(ões) pendente(s)...`);
                // Aqui você pode implementar a lógica de reenvio
            }
        } catch (error) {
            console.error('Erro ao processar inscrições pendentes:', error);
        }
    }
    
    // Verificar inscrições pendentes quando a conexão voltar
    window.addEventListener('online', tentarReenviarPendentes);
    
    // Verificar inscrições pendentes ao carregar a página
    tentarReenviarPendentes();
});
