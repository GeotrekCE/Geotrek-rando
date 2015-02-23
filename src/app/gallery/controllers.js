'use strict';

function GalleryController($rootScope, $scope) {
    var gallery = document.querySelector('.lightbox-gallery'),
        slides = [];

    function computeMargins() {
        _.each(slides, function (element) {
            var width = parseInt(window.getComputedStyle(element.querySelector('img')).width.slice(0, -2), 10);
            var height = parseInt(window.getComputedStyle(element.querySelector('img')).height.slice(0, -2), 10);

            element.style.marginLeft = width / -2 + "px";
            element.style.marginTop = height / -2 + "px";
        });
    }

    function initGallery(images) {
        var i;

        slides = [];

        var listeHandler = document.createElement('ul');
        _.each(images, function (image) {
            var currentImage = document.createElement('li');
            var picture = document.createElement('img');
            picture.src = image.url;
            picture.alt = image.legend;
            currentImage.appendChild(picture);
            var credits = document.createElement('div');
            credits.textContent = image.author;
            credits.className = 'credits';
            currentImage.appendChild(credits);
            slides.push(currentImage);
            listeHandler.appendChild(currentImage);
        });

        gallery.insertBefore(listeHandler, gallery.querySelector('.controls'));

        computeMargins();
        for (i = 0; i < slides.length; i++) {
            if (i > 0 && i < slides.length - 1) {
                slides[i].classList.add('inactive');
            }
            if (i === slides.length - 1) {
                slides[i].classList.add('prev');
            }
        }

    }

    function getNextSlide(slideIndex) {
        if (slideIndex === slides.length - 1) {
            return slides[0];
        }

        return slides[slideIndex + 1];
    }

    function getPrevSlide(slideIndex) {
        if (slideIndex <= 0) {
            return slides[slides.length - 1 + slideIndex];
        }

        return slides[slideIndex - 1];
    }

    function displaySlideX(slideIndex) {
        var i = 0,
            prevSlide = getPrevSlide(slideIndex);
        console.log(slides.indexOf(prevSlide));
        for (i = 0; i < slides.length; i++) {
            if (slides[i].classList.contains('prev')) {
                slides[i].classList.remove('prev');
            }
            if (slides[i].classList.contains('inactive')) {
                slides[i].classList.remove('inactive');
            }
            if (i !== slideIndex && i !== slides.indexOf(prevSlide)) {
                if (!slides[i].classList.contains('inactive')) {
                    slides[i].classList.add('inactive');
                }
            }
        }
        prevSlide.classList.add('prev');
    }

    function openLightbox(slideIndex) {
        if (typeof slideIndex === 'number') {
            displaySlideX(slideIndex);
        }

        gallery.classList.add('active');
    }

    function closeLightbox() {
        gallery.classList.remove('active');
    }

    $scope.next = function () {
        var i,
            currentSlide,
            nextSlide,
            prevSlide;
        for (i = 0; i < slides.length; i++) {
            if (!slides[i].classList.contains('inactive') && !slides[i].classList.contains('prev')) {
                currentSlide = slides[i];
                nextSlide = getNextSlide(i);
                prevSlide = getPrevSlide(i);
            }
        }

        currentSlide.classList.add('prev');

        if (slides.length > 2) {
            nextSlide.classList.remove('inactive');
            prevSlide.classList.remove('prev');
            prevSlide.classList.add('inactive');
        } else {
            nextSlide.classList.remove('prev');
        }
    };

    $scope.prev = function () {
        var i,
            currentSlide,
            newPrevSlide,
            prevSlide;
        for (i = 0; i < slides.length; i++) {
            if (!slides[i].classList.contains('inactive') && !slides[i].classList.contains('prev')) {
                currentSlide = slides[i];
                prevSlide = getPrevSlide(i);
                newPrevSlide = getPrevSlide(i - 1);
            }
        }
        if (slides.length > 2) {
            currentSlide.classList.add('inactive');
        }
        prevSlide.classList.remove('prev');
        newPrevSlide.classList.remove('inactive');
        newPrevSlide.classList.add('prev');
    };

    $scope.close = function () {
        closeLightbox();
    };

    //Remove Gallery content on state change
    $rootScope.$on("$stateChangeSuccess", function () {
        if (gallery.querySelector('ul')) {
            gallery.removeChild(gallery.querySelector('ul'));
        }
    });

    $rootScope.$on("initGallery", function (event, images) {
        initGallery(images);
    });

    $rootScope.$on("openLightbox", function (event, slideIndex) {
        openLightbox(slideIndex);
    });

    jQuery(window).on('resize', computeMargins);

}

module.exports = {
    GalleryController: GalleryController
};