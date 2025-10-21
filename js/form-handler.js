// Manipulador de formulários para envio ao Discord
document.addEventListener('DOMContentLoaded', function() {
    const formulariosCadastro = document.querySelectorAll('form[id^="form-cadastro"]');
    
    formulariosCadastro.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Coletar dados do formulário
            const formData = new FormData(this);
            const dados = {};
            
            for (const [key, value] of formData.entries()) {
                dados[key] = value;
            }
            
            // Adicionar informações adicionais
            dados.curso = this.getAttribute('data-curso');
            dados.dataInscricao = new Date().toLocaleString('pt-BR');
            
            // Enviar para o webhook do Discord
            enviarParaDiscord(dados, this);
        });
    });
    
    function enviarParaDiscord(dados, formulario) {
        const webhookURL = 'https://discord.com/api/webhooks/1430258829165199490/6t1fJXseq3PRqZ6n1n05olNazwiSts39YUsAxEVjrPsZesfsGUfrcSgFsdORyI3cMod6';
        
        // Formatar mensagem para o Discord
        const mensagem = {
            content: 'Nova inscrição recebida!',
            embeds: [{
                title: `Inscrição no curso: ${dados.curso}`,
                color: 0x8A2BE2,
                fields: [
                    {
                        name: 'Nome',
                        value: dados.nome || 'Não informado',
                        inline: true
                    },
                    {
                        name: 'Idade',
                        value: dados.idade || 'Não informado',
                        inline: true
                    },
                    {
                        name: 'CPF',
                        value: dados.cpf || 'Não informado',
                        inline: true
                    },
                    {
                        name: 'Nome da Mãe',
                        value: dados.mae || 'Não informado',
                        inline: true
                    },
                    {
                        name: 'Nome do Pai',
                        value: dados.pai || 'Não informado',
                        inline: true
                    },
                    {
                        name: 'E-mail',
                        value: dados.email || 'Não informado',
                        inline: true
                    },
                    {
                        name: 'Telefone',
                        value: dados.telefone || 'Não informado',
                        inline: true
                    },
                    {
                        name: 'Data da Inscrição',
                        value: dados.dataInscricao,
                        inline: true
                    }
                ],
                timestamp: new Date().toISOString()
            }]
        };
        
        // Alterar estado do botão
        const botao = formulario.querySelector('button[type="submit"]');
        const textoOriginal = botao.textContent;
        
        botao.textContent = 'Enviando...';
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
                botao.textContent = 'Inscrição Concluída!';
                botao.style.backgroundColor = '#4CAF50';
                
                setTimeout(() => {
                    // Redirecionar para a página de agradecimento
                    window.location.href = 'obrigado.html';
                }, 1500);
            } else {
                throw new Error('Erro ao enviar dados');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            botao.textContent = 'Erro ao enviar. Tente novamente.';
            botao.style.backgroundColor = '#f44336';
            
            setTimeout(() => {
                botao.textContent = textoOriginal;
                botao.disabled = false;
                botao.style.backgroundColor = '';
            }, 3000);
        });
    }
});
