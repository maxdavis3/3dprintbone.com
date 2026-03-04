/* Premium Main JS */
document.addEventListener('DOMContentLoaded', function() {

    // Mobile Navigation
    var navToggle = document.querySelector('.nav-toggle');
    var navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            var expanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!expanded));
        });

        var navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Header scroll effect
    var header = document.querySelector('.site-header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Active nav link
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    var allNavLinks = document.querySelectorAll('.nav-link');
    allNavLinks.forEach(function(link) {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Intersection Observer for scroll animations
    var animateElements = document.querySelectorAll('.animate-in');
    if (animateElements.length > 0 && 'IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        animateElements.forEach(function(el) {
            observer.observe(el);
        });
    }

    // Counter animation for stat numbers
    var statNumbers = document.querySelectorAll('.stat-number[data-count]');
    if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
        var counterObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    var target = parseInt(el.getAttribute('data-count'), 10);
                    var suffix = el.textContent.replace(/[0-9]/g, '');
                    var duration = 2000;
                    var start = 0;
                    var startTime = null;

                    function animate(timestamp) {
                        if (!startTime) startTime = timestamp;
                        var progress = Math.min((timestamp - startTime) / duration, 1);
                        var eased = 1 - Math.pow(1 - progress, 3);
                        var current = Math.floor(eased * target);
                        el.textContent = current + suffix;
                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        }
                    }
                    requestAnimationFrame(animate);
                    counterObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(function(el) {
            counterObserver.observe(el);
        });
    }

    // Form validation with inline errors
    var rfqForm = document.getElementById('rfqForm');
    if (rfqForm) {
        rfqForm.addEventListener('submit', function(e) {
            var nameInput = document.getElementById('name');
            var emailInput = document.getElementById('email');
            var messageInput = document.getElementById('message');
            var nameError = document.getElementById('name-error');
            var emailError = document.getElementById('email-error');
            var messageError = document.getElementById('message-error');
            var hasError = false;

            // Clear previous errors
            [nameInput, emailInput, messageInput].forEach(function(input) {
                if (input) input.classList.remove('error');
            });
            [nameError, emailError, messageError].forEach(function(err) {
                if (err) err.textContent = '';
            });

            if (nameInput && !nameInput.value.trim()) {
                nameInput.classList.add('error');
                if (nameError) nameError.textContent = 'Please enter your full name.';
                hasError = true;
            }

            if (emailInput) {
                if (!emailInput.value.trim()) {
                    emailInput.classList.add('error');
                    if (emailError) emailError.textContent = 'Please enter your email address.';
                    hasError = true;
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
                    emailInput.classList.add('error');
                    if (emailError) emailError.textContent = 'Please enter a valid email address.';
                    hasError = true;
                }
            }

            if (messageInput && !messageInput.value.trim()) {
                messageInput.classList.add('error');
                if (messageError) messageError.textContent = 'Please enter a message.';
                hasError = true;
            }

            if (hasError) {
                e.preventDefault();
                var firstError = rfqForm.querySelector('.error');
                if (firstError) firstError.focus();
            }
        });
    }

});

/* ========================================
   BIOPRINTING RESEARCH FEED (PubMed E-utilities API — no proxy needed)
   ======================================== */
(function() {
  var eutils = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
  var query = 'bioprinting+tissue+engineering';
  var rendered = false;

  function renderNews(articles) {
    if (rendered) return;
    rendered = true;
    var container = document.getElementById('news-feed');
    if (!container) return;
    if (!articles || !articles.length) {
      container.innerHTML = '<div class="news-error"><p>Unable to load research at this time. <a href="https://pubmed.ncbi.nlm.nih.gov/?term=bioprinting" target="_blank" rel="noopener">Browse PubMed</a></p></div>';
      return;
    }
    container.innerHTML = '<div class="news-grid">' + articles.slice(0, 3).map(function(a) {
      var authors = a.authors && a.authors.length
        ? a.authors.slice(0, 2).map(function(x) { return x.name; }).join(', ') + (a.authors.length > 2 ? ' et al.' : '')
        : '';
      var desc = (authors ? authors + '. ' : '') + (a.source ? a.source + '.' : '');
      return '<div class="news-card">' +
        '<div class="news-card-image"><span class="news-placeholder">&#129516;</span></div>' +
        '<div class="news-card-body">' +
          '<div class="news-card-source">PubMed' + (a.source ? ' — ' + a.source : '') + '</div>' +
          '<h3>' + a.title + '</h3>' +
          (desc ? '<p>' + desc + '</p>' : '') +
          '<div class="news-card-date">' + (a.pubdate || '') + '</div>' +
          '<a href="https://pubmed.ncbi.nlm.nih.gov/' + a.uid + '/" target="_blank" rel="noopener noreferrer">Read Article →</a>' +
        '</div></div>';
    }).join('') + '</div>';
  }

  var timeout = setTimeout(function() { renderNews([]); }, 12000);

  fetch(eutils + 'esearch.fcgi?db=pubmed&term=' + query + '&retmax=6&retmode=json&sort=date')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var ids = data.esearchresult && data.esearchresult.idlist;
      if (!ids || !ids.length) throw new Error('no ids');
      return fetch(eutils + 'esummary.fcgi?db=pubmed&id=' + ids.join(',') + '&retmode=json');
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      clearTimeout(timeout);
      var articles = [];
      var uids = (data.result && data.result.uids) || [];
      uids.forEach(function(uid) {
        var item = data.result[uid];
        if (item && item.title) {
          articles.push({ uid: uid, title: item.title.replace(/\.$/, ''), source: item.source || '', pubdate: item.pubdate || '', authors: item.authors || [] });
        }
      });
      renderNews(articles);
    })
    .catch(function() {
      clearTimeout(timeout);
      renderNews([]);
    });

  document.addEventListener('DOMContentLoaded', function() {
    var container = document.getElementById('news-feed');
    if (container && !container.innerHTML.trim()) {
      container.innerHTML = '<p class="news-loading">Loading latest bioprinting research…</p>';
    }
  });
})();

/* ========================================
   WEB3FORMS CONTACT FORM
   ======================================== */
document.addEventListener('DOMContentLoaded', function() {
  var contactForms = document.querySelectorAll('#rfqForm, #contact-form');
  contactForms.forEach(function(form) {
    var msgEl = form.querySelector('.form-message');
    if (!msgEl) {
      msgEl = document.createElement('div');
      msgEl.className = 'form-message';
      form.insertBefore(msgEl, form.firstChild);
    }
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      msgEl.textContent = ''; msgEl.className = 'form-message';
      var nameEl=form.querySelector('[name="name"]');
      var emailEl=form.querySelector('[name="email"]');
      var messageEl=form.querySelector('[name="message"]');
      var errors=[];
      if(nameEl&&!nameEl.value.trim()) errors.push('Please enter your name.');
      if(emailEl){
        if(!emailEl.value.trim()){errors.push('Please enter your email.');}
        else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())){errors.push('Please enter a valid email address.');}
      }
      if(messageEl&&!messageEl.value.trim()) errors.push('Please enter a message.');
      if(errors.length>0){msgEl.className='form-message error';msgEl.innerHTML=errors.join('<br>');return;}
      var submitBtn=form.querySelector('[type="submit"]');
      if(submitBtn){submitBtn.disabled=true;submitBtn.textContent='Sending...';}
      var formData=new FormData(form);
      if(!formData.get('access_key')) formData.append('access_key','6f33053b-6d08-414b-9615-665f88c98da8');
      fetch('https://api.web3forms.com/submit',{method:'POST',body:formData})
        .then(function(r){return r.json();})
        .then(function(data){
          if(submitBtn){submitBtn.disabled=false;submitBtn.textContent='Send Message';}
          if(data.success){msgEl.className='form-message success';msgEl.textContent='Thank you! Your message has been sent. We will respond within 24 hours.';form.reset();}
          else{msgEl.className='form-message error';msgEl.textContent='Error sending message: '+(data.message||'Please try again.');}
        })
        .catch(function(){
          if(submitBtn){submitBtn.disabled=false;submitBtn.textContent='Send Message';}
          msgEl.className='form-message error';msgEl.textContent='Network error. Please check your connection and try again.';
        });
    });
  });
});
