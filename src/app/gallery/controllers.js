'use strict';

function GalleryController(images, slideIndex, $q, $scope, $modalInstance) {
/*
    var gallery = document.querySelector('.lightbox-gallery'),
        slides = [];

    function computeMargins() {
        var lightbox = document.querySelector('.lightbox-gallery'),
            lightboxWidth = parseInt(window.getComputedStyle(lightbox).width, 10) - parseInt(window.getComputedStyle(lightbox).paddingLeft, 10) - parseInt(window.getComputedStyle(lightbox).paddingRight, 10),
            lightboxHeight = parseInt(window.getComputedStyle(lightbox).height, 10) - parseInt(window.getComputedStyle(lightbox).paddingTop, 10) - parseInt(window.getComputedStyle(lightbox).paddingBottom, 10);

        _.each(slides, function (element) {
            var tempImg = document.createElement('img');
            tempImg.src = element.querySelector('img').src;
            tempImg.onload = function () {
                var width = 0, height = 0;
                var tempWidth = tempImg.width;
                var tempHeight = tempImg.height;
                var ratio = tempWidth / tempHeight;
                if (tempWidth > tempHeight) {
                    if (tempWidth > lightboxWidth) {
                        width = lightboxWidth;
                    } else {
                        width = tempWidth;
                    }
                    height = width / ratio;

                } else {
                    if (tempHeight > lightboxHeight) {
                        height = lightboxHeight;
                    } else {
                        height = tempHeight;
                    }
                    width = height * ratio;
                }

                element.style.marginLeft = width / -2 + "px";
                element.style.marginTop = height / -2 + "px";
            };
        });
    }

    function updateMarginsOnResize() {
        if ($scope.resizeTimeout) {
            window.clearTimeout($scope.resizeTimeout);
        }
        $scope.resizeTimeout = window.setTimeout(computeMargins, 800);
    }

    function initGallery(images) {
        var i;

        slides = [];
        var listeHandler = document.createElement('ul');
        _.forEach(images, function (image) {
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
        var controls = gallery.querySelector('.controls');

        computeMargins();
        if (slides.length > 1) {
            if (controls.querySelector('.prev').classList.contains('hidden')) {
                controls.querySelector('.prev').classList.remove('hidden');
            }

            if (controls.querySelector('.next').classList.contains('hidden')) {
                controls.querySelector('.next').classList.remove('hidden');
            }

            for (i = 0; i < slides.length; i++) {
                if (i > 0 && i < slides.length - 1) {
                    slides[i].classList.add('inactive');
                }
                if (i === slides.length - 1) {
                    slides[i].classList.add('prev');
                }
            }
        } else {
            controls.querySelector('.prev').classList.add('hidden');
            controls.querySelector('.next').classList.add('hidden');
        }


        window.angular.element(window).on('resize', updateMarginsOnResize);

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
        if (typeof slideIndex === 'number' && slides.length > 1) {
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

    $rootScope.$on("$stateChangeStart", function () {
        window.angular.element(window).off('resize', updateMarginsOnResize);
    });

    $rootScope.$on("initGallery", function (event, images) {
        initGallery(images);
    });

    $rootScope.$on("openLightbox", function (event, slideIndex) {
        openLightbox(slideIndex);
    });

*/
    function computeMargin(image) {
        var deferred = $q.defer();

        var docElement = document.documentElement,
            curentBody = document.getElementsByTagName('body')[0],
            // viewportWidth = window.innerWidth || docElement.clientWidth || curentBody.clientWidth,
            viewportHeight = window.innerHeight || docElement.clientHeight || curentBody.clientHeight;

        var computedMargin = 0;
        var tempImg = document.createElement('img');
        tempImg.onload = function () {
            computedMargin = (viewportHeight - tempImg.height) / 2;
            deferred.resolve(computedMargin);
        };
        tempImg.src = image.url;

        return deferred.promise;
    }

    function initGallery() {
        $scope.slides = [];
        $scope.myInterval = 0;

        _.forEach(images, function (image) {
            computeMargin(image)
                .then(
                    function (currentMargin) {
                        $scope.slides.push({
                            url: image.url,
                            text: image.legend + ' - ' + image.author,
                            marginTop: currentMargin + 'px'
                        });

                        if ($scope.slides[slideIndex]) {
                            $scope.slides[slideIndex].active = true;
                        }
                    }
                );
        });
    }

    function resizeCompute() {
        _.forEach($scope.slides, function (slide) {
            computeMargin(slide)
                .then(
                    function (currentMargin) {
                        slide.marginTop = currentMargin + 'px';
                    }
                );
        });
    }

    $scope.close = function close () {
        $modalInstance.dismiss('close');
    };

    jQuery(window).on('resize', function () {
        if ($scope.resizeTimeout) {
            window.clearTimeout($scope.resizeTimeout);
        }
        $scope.resizeTimeout = window.setTimeout(resizeCompute, 800);
    });

    initGallery();

}

module.exports = {
    GalleryController: GalleryController
};
