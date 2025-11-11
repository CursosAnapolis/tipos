// Manipulador de formulários para envio ao Discord - VERSÃO CORRIGIDA
document.addEventListener('DOMContentLoaded', function() {
    // DEBUG - Verificar se script está carregando
    console.log('✅ Script form-handler.js carregado!');
    
    const formulariosCadastro = document.querySelectorAll('form[id^="form-cadastro"]');
    
    // DEBUG - Verificar forms encontrados
    console.log(`📝 Forms encontrados: ${formulariosCadastro.length}`);
    formulariosCadastro.forEach((form, index) => {
        console.log(`Form ${index + 1}:`, form.id, form.getAttribute('data-curso'));
    });
    
    formulariosCadastro.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('🎯 Form submetido:', this.id);
            
            // Validar formulário antes de enviar
            if (!validarFormulario(this)) {
                console.log('❌ Validação falhou');
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
            
            console.log('📦 Dados coletados:', dados);
            
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
        const webhookURL = 'https://discord.com/api/webhooks/1437930703399424101/kARO7hbLaDu2n_1Atz1AeyzT0Ut4GIe8QXOks3ykpcTgR8QCHCWYdCsJpCss9eCTgLdN';
        
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
        
        console.log('🚀 Enviando para Discord...');
        
        // Fazer a requisição para o webhook
        fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mensagem)
        })
        .then(response => {
            console.log('📨 Resposta do Discord:', response.status, response.statusText);
            
            if (response.ok) {
                // Sucesso - redirecionar para página de agradecimento
                botao.textContent = '✅ Inscrição Concluída!';
                botao.classList.add('form-success');
                
                setTimeout(() => {
                    // ✅ CORREÇÃO PRINCIPAL - Redirecionamento para GitHub Pages
                    console.log('🔄 Redirecionando para página de agradecimento...');
                    
                    // Verificar se estamos em produção (GitHub Pages) ou local
                    const isGitHubPages = window.location.hostname.includes('github.io');
                    const currentPath = window.location.pathname;
                    
                    if (isGitHubPages) {
                        // No GitHub Pages - usar caminho relativo ao repositório
                        if (currentPath.includes('/pages/')) {
                            window.location.href = '../pages/obrigado.html';
                        } else {
                            window.location.href = 'pages/obrigado.html';
                        }
                    } else {
                        // Desenvolvimento local
                        if (currentPath.includes('/pages/')) {
                            window.location.href = '../pages/obrigado.html';
                        } else {
                            window.location.href = './pages/obrigado.html';
                        }
                    }
                }, 1500);
            } else {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
        })
        .catch(error => {
            console.error('❌ Erro ao enviar para Discord:', error);
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
            console.log('💾 Inscrição salva localmente para envio posterior.');
            
            // Mostrar mensagem alternativa de sucesso
            alert('Inscrição salva! Entraremos em contato em breve.');
        } catch (error) {
            console.error('Erro ao salvar localmente:', error);
            alert('Erro ao processar inscrição. Por favor, tente novamente.');
        }
    }
    
    // Tentar reenviar inscrições pendentes quando online
    function tentarReenviarPendentes() {
        try {
            const inscricoes = JSON.parse(localStorage.getItem('inscricoes_pendentes') || '[]');
            const pendentes = inscricoes.filter(insc => !insc.enviado);
            
            if (pendentes.length > 0 && navigator.onLine) {
                console.log(`🔄 Tentando reenviar ${pendentes.length} inscrição(ões) pendente(s)...`);
                
                // Aqui você pode implementar a lógica de reenvio em lote
                pendentes.forEach((inscricao, index) => {
                    setTimeout(() => {
                        reenviarInscricao(inscricao, index);
                    }, index * 2000); // Delay de 2 segundos entre cada envio
                });
            }
        } catch (error) {
            console.error('Erro ao processar inscrições pendentes:', error);
        }
    }
    
    // Função para reenviar uma inscrição pendente
    function reenviarInscricao(inscricao, index) {
        const webhookURL = 'https://discord.com/api/webhooks/1429236562134302781/9aDDtdDEO18AtU_Z7s08oRx9vjwhaez9shQWO6P3Ycf0ljNPM5iEitEd1f_8p8Opj-o2';
        
        const mensagem = {
            content: '🔄 INSCRIÇÃO PENDENTE (reenvio)',
            embeds: [{
                title: `Inscrição no curso: ${inscricao.curso}`,
                color: 0xFFA500,
                fields: [
                    { name: '👤 Nome', value: inscricao.nome || 'Não informado', inline: true },
                    { name: '🎂 Idade', value: inscricao.idade || 'Não informado', inline: true },
                    { name: '📄 CPF', value: inscricao.cpf || 'Não informado', inline: true },
                    { name: '📧 E-mail', value: inscricao.email || 'Não informado', inline: true },
                    { name: '📞 Telefone', value: inscricao.telefone || 'Não informado', inline: true },
                    { name: '📅 Data Original', value: inscricao.timestamp, inline: true }
                ],
                footer: { text: 'Cursos Anápolis - Sistema de Inscrições (Pendente)' }
            }]
        };
        
        fetch(webhookURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mensagem)
        })
        .then(response => {
            if (response.ok) {
                console.log(`✅ Inscrição pendente ${index + 1} reenviada com sucesso`);
                // Marcar como enviada no localStorage
                marcarComoEnviada(inscricao.timestamp);
            }
        })
        .catch(error => {
            console.error(`❌ Erro ao reenviar inscrição pendente ${index + 1}:`, error);
        });
    }
    
    function marcarComoEnviada(timestamp) {
        try {
            const inscricoes = JSON.parse(localStorage.getItem('inscricoes_pendentes') || '[]');
            const index = inscricoes.findIndex(insc => insc.timestamp === timestamp);
            if (index !== -1) {
                inscricoes[index].enviado = true;
                localStorage.setItem('inscricoes_pendentes', JSON.stringify(inscricoes));
            }
        } catch (error) {
            console.error('Erro ao marcar como enviada:', error);
        }
    }
    
    // Verificar inscrições pendentes quando a conexão voltar
    window.addEventListener('online', tentarReenviarPendentes);
    
    // Verificar inscrições pendentes ao carregar a página
    tentarReenviarPendentes();
});
