// Navegação suave e funcionalidades gerais
document.addEventListener('DOMContentLoaded', function() {
    // Navegação suave para links internos
    const links = document.querySelectorAll('a[href^="#"]');
    
    for (const link of links) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
    
    // Header fixo com efeito de transparência ao rolar
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.backgroundColor = 'var(--white)';
            header.style.backdropFilter = 'none';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
    });
    
    // Formulário de contato
    const formContato = document.getElementById('form-contato');
    if (formContato) {
        formContato.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simulação de envio
            const button = this.querySelector('button[type="submit"]');
            const originalText = button.textContent;
            
            button.innerHTML = '<div class="loading"></div> Enviando...';
            button.disabled = true;
            
            setTimeout(function() {
                button.textContent = 'Mensagem Enviada!';
                button.classList.add('form-success');
                
                setTimeout(function() {
                    button.textContent = originalText;
                    button.disabled = false;
                    button.classList.remove('form-success');
                    formContato.reset();
                }, 3000);
            }, 1500);
        });
    }
    
    // Animações de entrada
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Aplicar animações aos elementos
    const animatedElements = document.querySelectorAll('.curso-card, .sobre-content, .contato-content');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Máscara para CPF
    const cpfInputs = document.querySelectorAll('input[name="cpf"]');
    cpfInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            }
            e.target.value = value;
        });
    });
    
    // Máscara para telefone
    const telInputs = document.querySelectorAll('input[name="telefone"]');
    telInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
                value = value.replace(/(\d)(\d{4})$/, '$1-$2');
            }
            e.target.value = value;
        });
    });
    
    // Validação de idade
    const idadeInputs = document.querySelectorAll('input[name="idade"]');
    idadeInputs.forEach(input => {
        input.addEventListener('blur', function(e) {
            const idade = parseInt(e.target.value);
            if (idade < 1) {
                alert('É necessário ter pelo menos 16 anos para se inscrever.');
                e.target.focus();
            } else if (idade > 100) {
                alert('Por favor, insira uma idade válida.');
                e.target.focus();
            }
        });
    });
});
