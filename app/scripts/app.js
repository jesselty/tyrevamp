'use strict';

/* Angular style promise implementation */

! function(window, undefined) {
    var $q = $q;

    function deferQ() {
        var that = this;
        that.resolved = false;
        that._cBArr = [];
        that.args = null;
        that.promise = {
            then: function(cB) {
                if (that.resolved) {
                    cB.apply(that, args);
                } else {
                    that._cBArr.push(cB);
                }
            }
        }
    }

    deferQ.prototype.resolve = function() {
        var that = this,
            args = arguments;

        that._cBArr.map(function(cB, key) {
            cB.apply(that, args);
        });

        that.resolved = true;
    };

    window.$q = $q || {
        defer: function() {
            return new deferQ();
        }
    };
}(window);
/* End: Angular style promise implementation */

! function(window, $, undefined) {
    $.fn.tyDatePicker = function() {
        var that = this,
            picker;
        $(that).each(function(value, key) {
            picker = new Pikaday({
                minDate: new Date(),
                field: $(this)[0],
                position: 'top right',
                numberOfMonths: 2
            });

            picker.setDate(new Date());

            $(this).setDt = function(dt) {
                picker.setDate(dt);
            };
        });
    };
}(window, jQuery);

! function(window, $, undefined) {
    $.fn.setAutoComplete = function(results, popularCities) {
        var _that = this,
            documentFragment = document.createDocumentFragment(),
            ulElem,
            searchResultsElem,
            keyEvntTimeout,
            hoverEvntTimeout,
            isScrolling = false,
            popularCities = popularCities || [];

        function capitalizeFirstLetterFn(string) {
            return string
                .replace(/(^\w)/, function(l) {
                    return l.toUpperCase();
                });
        }

        function onKeyEvents(e) {
            var that = this,
                key = e.keyCode || e.which;
            clearTimeout(keyEvntTimeout);
            keyEvntTimeout = setTimeout(function() {
                if (key !== 38 && key !== 40) {
                    findMatchingCity(results, $(that), popularCities);
                }
            }, 300);
        }

        function showSearchResultsIfEmpty(searchResults) {
            if (searchResults.length === 0) {
                findMatchingCity(results, $(this), popularCities);
                return true;
            }
            return false;
        }

        function navigateArrowFn(e) {
            var that = this,
                key = e.keyCode || e.which,
                highlighted = $(that).siblings('.atc-city-matched').find('.atc-search-highlighted')[0],
                searchResults = $(that).siblings('.atc-city-matched').find('ul li'),
                elemToHighlight;

            var wasEmpty = showSearchResultsIfEmpty.call(that, searchResults);

            if (wasEmpty) {
                return;
            }

            if (key === 13) {
                $(_that).val($(highlighted).text());
                e.preventDefault();
                return;
            }

            if (key === 38) {
                if (!highlighted) {
                    elemToHighlight = $(searchResults[searchResults.length - 1]);
                } else {
                    elemToHighlight = $($(highlighted).prev()[0] || searchResults[searchResults.length - 1]);
                    $(highlighted).removeClass('atc-search-highlighted');
                    if (elemToHighlight.position().top < 0 ||
                        elemToHighlight.position().top >= searchResultsElem.height()) {
                        searchResultsElem.scrollTop(searchResultsElem.scrollTop() + elemToHighlight.position().top);
                    }
                }
                $(this).val(elemToHighlight.text());
                elemToHighlight.addClass('atc-search-highlighted');
            } else if (key === 40) {
                if (!highlighted) {
                    elemToHighlight = $(searchResults[0]);
                    searchResultsElem.scrollTop(0);
                } else {
                    elemToHighlight = $($(highlighted).next()[0] || searchResults[0]);
                    $(highlighted).removeClass('atc-search-highlighted');
                    if (elemToHighlight.position().top >= searchResultsElem.height() ||
                        elemToHighlight.position().top < 0) {
                        searchResultsElem.scrollTop(searchResultsElem.scrollTop() +
                            elemToHighlight.position().top -
                            (searchResultsElem.height() - elemToHighlight.outerHeight())
                        );
                    }
                }
                $(this).val(elemToHighlight.text());
                elemToHighlight.addClass('atc-search-highlighted');
            }
        }

        function clearUlElemFn(ulElem) {
            if (ulElem) {
                ulElem.innerHTML = "";
            }
        }

        function findMatchingCity(city, inputElement, popularCities) {
            var escapedText = inputElement.val().replace(/(?!\s)\W/g, ""),
                pmatchIndex = 0,
                matchIndex = 0,
                isInpEmpty = (escapedText.length === 0);
            ulElem = document.createElement('ul');
            documentFragment.appendChild(ulElem);
            clearUlElemFn(ulElem);

            if (popularCities.length > 0 && isInpEmpty) {
                popularCities.map(function(value, key) {
                    var liElem;
                    liElem = document.createElement('li');
                    liElem.className = 'atc-city-search';
                    liElem.title = capitalizeFirstLetterFn(value);
                    liElem.innerHTML = capitalizeFirstLetterFn(value);
                    if (pmatchIndex === 0) {
                        liElem.className += ' atc-popular-results atc-search-highlighted';
                    }
                    ulElem.appendChild(liElem);
                    pmatchIndex++;
                });
            }

            if (city.length > 0) {
                city.map(function(value, key) {
                    var liElem,
                        regex = new RegExp("^" + escapedText, 'i');
                    if (regex.test(value.replace(/(?!\s)\W/g, "")) || isInpEmpty) {
                        liElem = document.createElement('li');
                        liElem.className = 'atc-city-search';
                        liElem.title = capitalizeFirstLetterFn(value);
                        liElem.innerHTML = capitalizeFirstLetterFn(value);
                        if ((!isInpEmpty || popularCities.length === 0) && matchIndex === 0) {
                            liElem.className += ' atc-search-highlighted';
                        } else if (matchIndex === 0) {
                            liElem.className += ' atc-all-results';
                        }
                        ulElem.appendChild(liElem);
                        matchIndex++;
                    }
                });
                inputElement.siblings('.atc-city-matched').html(documentFragment);
            } else {
                clearUlElemFn(ulElem);
            }
        }

        function initAutoCompleteFn() {
            searchResultsElem = $('<div class="atc-city-matched"></div>').insertAfter(_that);
        }

        initAutoCompleteFn();

        $(_that).on({
            'click': function() {
                findMatchingCity(results, $(this), popularCities);
            },
            'keyup': onKeyEvents,
            'keydown': navigateArrowFn,
            'blur': function(e) {
                var that = this;
                setTimeout(function(e) {
                    clearUlElemFn($(that).siblings('.atc-city-matched').find('ul')[0]);
                }, 100);
            }
        });

        searchResultsElem.on('click', '.atc-city-search', function(e) {
                $(_that).val($(this).text());
            })
            .on('mousemove', '.atc-city-search',
                function(e) {
                    var that = this;
                    if (!isScrolling) {
                        clearTimeout(hoverEvntTimeout);
                        hoverEvntTimeout = setTimeout(function(e) {
                            $(that)
                                .siblings('.atc-search-highlighted')
                                .removeClass('atc-search-highlighted');
                            $(that).addClass('atc-search-highlighted');
                        }, 300);
                    } else {
                        isScrolling = false;
                    }
                }
            )
            .on('scroll', function(e) {
                isScrolling = true;
            });
    };
}(window, jQuery);

! function(window, $, undefined) {
    var isCityListFetched,
        fromCityNames = [],
        toCityNames = [],
        stateNames = [];

    function initCities() {
        $.ajax({
            url: "/scripts/cities.json",
            dataType: 'json',
            success: function(result) {
                    var cities = result.data.cities;

                    //sortCities(cities);

                    for (var i = 0; i < cities.length; i++) {
                        var name = cities[i].CityName,
                            isFrom = cities[i].IsFrom,
                            isTo = cities[i].IsTo,
                            state = cities[i].StateName;

                        if (isFrom) {
                            fromCityNames.push(name);
                        }
                        if (isTo) {
                            toCityNames.push(name);
                        }

                        stateNames[name] = state.toLowerCase();
                    }

                    $("#from-city").setAutoComplete(fromCityNames, ['mumbai', 'bangalore', 'pune', 'hyderabad', 'vadodara', 'surat', 'gandhinagar']);
                    $("#to-city").setAutoComplete(toCityNames, ['mumbai', 'bangalore', 'pune', 'hyderabad']);

                    isCityListFetched = true; //flag to check if city list has been downloaded
                }
                /*,
                complete: function() {
                    loadSpriteImg();
                }*/
        });
    }

    function initSwapCities() {
        $('#swapCities').click(function() {
            var fromCity = $('#from-city').val(),
                toCity = $('#to-city').val();

            $('#from-city').val(toCity);
            $('#from-city').focus(); // to trigger event for 'Clear' button.
            $('#to-city').val(fromCity);
            $('#to-city').focus(); // to trigger event for 'Clear' button.
            $('#to-city').blur(); // remove focus.
        });
    }

    function isValidCity(city, cities) {
        city = city.toLowerCase();
        for (var i = 0; i < cities.length; i++) {
            if (city === cities[i]) return 1;
        }
        return 0;
    }

    function validateCity($el, cities) {
        var city = $el.val();
        if (city === '' || !isValidCity(city, cities)) {
            $el.addClass("invalid");
            return false;
        } else {
            $el.removeClass("invalid");
            return true;
        }
    }

    //TODO: A better way
    function getLocalizedCC() {
        var cityName = $("#from-city").val().toLowerCase(),
            stateName = stateNames[cityName] || "karnataka";

        $("#fcs").val(stateName.toLowerCase());

        // only for Mumbai, localize to Mumbai CC
        if (cityName.search(/mumbai/i) > -1) {
            var cc = "10";
        } else if (cityName.search(/vashi/i) > -1) {
            var cc = "10";
        } else if (cityName.search(/thane/i) > -1) {
            var cc = "10";
        } else if (cityName.search(/delhi/i) > -1) {
            var cc = "12";
        } else if (cityName.search(/new delhi/i) > -1) {
            var cc = "12";
        } else if (cityName.search(/kolkata/i) > -1) {
            var cc = "9";
        } else if (cityName.search(/chandigarh/i) > -1) {
            var cc = "3";
        } else if (cityName.search(/ludhiana/i) > -1) {
            var cc = "3";
        } else if (cityName.search(/amritsar/i) > -1) {
            var cc = "3";
        } else if (cityName.search(/jalandhar/i) > -1) {
            var cc = "3";
        } else if (cityName.search(/indore/i) > -1) {
            var cc = "7";
        } else if (cityName.search(/jaipur/i) > -1) {
            var cc = "8";
        } else if (cityName.search(/nagpur/i) > -1) {
            var cc = "11";
        } else if (cityName.search(/surat/i) > -1) {
            var cc = "16";
        } else if (cityName.search(/baroda/i) > -1) {
            var cc = "2";
        } else if (cityName.search(/goa/i) > -1) {
            var cc = "5";
        } else if (cityName.search(/pune/i) > -1) {
            var cc = "13";
        } else if (cityName.search(/raipur/i) > -1) {
            var cc = "14";
        } else if (cityName.search(/rajkot/i) > -1) {
            var cc = "15";
        } else if (cityName.search(/chennai/i) > -1) {
            var cc = "4";
        } else {
            switch (stateName) {
                case "karnataka":
                case "kerala":
                case "":
                    var cc = "0";
                    break;
                case "andhra pradesh":
                    var cc = "6";
                    break;
                case "tamil nadu":
                    var cc = "4";
                    break;
                case "punjab":
                    var cc = "3";
                    break;
                case "west bengal":
                    var cc = "9";
                    break;

                default:
                    var cc = "1";
                    break;
            }
        }

        selectCC(cc);
    }

    function selectCC(index) {
        var seltdLoctn = $(".contactNoDD li:eq(" + index + ")").children("label").text();
        var seltdLoctnNo = $(".contactNoDD li:eq(" + index + ")").children("span").text();
        $(".currLoctn").text(seltdLoctn);
        $(".currNo").text(seltdLoctnNo);
    }

    function getFormattedDateForURL(dateString) {
        dateString = (dateString || "").replace(/-/g, ' '); //firefox doesn't understand hyphens in date

        var d = new Date(dateString),
            day = d.getDate(),
            month = d.getMonth() + 1,
            year = d.getFullYear();

        if (day < 10) day = "0" + day;
        if (month < 10) month = "0" + month;

        return day + "-" + month + "-" + year;
    }

    initCities();
    initSwapCities();


    $('.ty-datepicker').tyDatePicker();
}(window, jQuery);

! function(window, $, undefined) {
    function loadScriptsAsyncfn(d, s, id, url, e) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s);
        js.id = id;
        js.async = true;
        js.src = url;
        js.onload = function() {
            var event = new Event(e);
            window.dispatchEvent(event);
        };

        window.addEventListener('load', function() {
            fjs.parentNode.insertBefore(js, fjs);
        }, false);
    };
    loadScriptsAsyncfn(document, 'script', 'google-jssdk', 'https://apis.google.com/js/api:client.js', 'GOOGLE_API_LOADED');

    $.fn.FBSocial = function(fbSettings, fbRtnSettings) {
        var that = this,
            FBDefer = $q.defer(),
            FACEBOOK_CONSTANTS = {
                STATUS: {
                    CONNECTED: 'connected',
                    NOT_AUTHORIZED: 'not_authorized'
                }
            };

        if (!fbSettings) {
            throw "Please provide FB login webapp settings";
        }

        function fbConnectedFn(response, meresponse) {
            FBDefer.resolve(response, meresponse);
        }

        function fbNotAuthorizedFn(response) {
            FBDefer.resolve(response);
        }

        function fbNotConnectedFn(response) {
            FBDefer.resolve(response);
        }

        function actOnLoginStateFn(response) {
            if (response.status == FACEBOOK_CONSTANTS.STATUS.CONNECTED) {
                FB.api('/me', function(meresponse) {
                    fbConnectedFn(response, meresponse);
                });
            } else if (response.status == FACEBOOK_CONSTANTS.STATUS.NOT_AUTHORIZED) {
                console.log(response);
            } else {
                console.log(response);
            }
        }

        loadScriptsAsyncfn(document, 'script', 'facebook-jssdk', '//connect.facebook.net/en_US/sdk.js', 'FACEBOOK_API_LOADED');

        window.fbAsyncInit = function() {
            FB.init(fbSettings);

            FB.getLoginStatus(function(response) {
                actOnLoginStateFn(response);
            }, fbRtnSettings);
        };

        $(that).click(function() {
            FB.login(function(response) {
                actOnLoginStateFn(response);
            }, fbRtnSettings);
        });

        return FBDefer.promise;
    };
}(window, jQuery);

! function(window, $, undefined) {
    $.fn.jqTabs = function(className, callback) {
        var _that = this,
            _callback = callback || function() {};

        function linkNavigateFn(e) {
            var that = this;
            $(className).hide();
            $($(that).attr('data-target-blk')).show();
            _callback.apply(that, [e]);
        }

        $(_that).on('click', '[data-target-blk]', linkNavigateFn)
    };
}(window, jQuery);

! function(window, $, undefined) {
    $('body').click(function() {
        $('.header-menu-blk').triggerHandler('close-open-blk');
    });
    $('.header-menu-blk').click(function(e) {
        e.stopPropagation();
        $(this).find('ul').toggle();
    }).on('close-open-blk', function() {
        $(this).find('ul').hide();
    });
    $('.ty-scrollto-top').click(function() {
        $('html, body').animate({ scrollTop: "0" }, 500);
    });
}(window, jQuery);

! function(window, jQuery, undefined) {
    var FB_SETTINGS = {
            appId: '1168184359859767',
            cookie: true,
            xfbml: true,
            version: 'v2.5'
        },
        FB_RTN_SETTINGS = {
            scope: 'user_photos,email,publish_actions,public_profile',
            return_scopes: true
        };

    function openAuthPopupFn() {
        $('#auth-popup').show();
    }

    function openLoginFn() {
        openAuthPopupFn();
        $('#auth-popup .popup-content')
            .addClass('is-signin')
            .removeClass('is-register is-password');
    }

    function openRegisterFn() {
        openAuthPopupFn();
        $('#auth-popup .popup-content')
            .addClass('is-register')
            .removeClass('is-signin is-password');
    }

    function openForgotPasswordFn() {
        openAuthPopupFn();
        $('#auth-popup .popup-content')
            .addClass('is-password')
            .removeClass('is-signin is-register');
    }

    function closePopupFn() {
        $('.user-popup').hide();
    }

    function showCalendarBlkBySelectionFn() {
        parseInt($(this).val(), 10) === 1 ?
            $('.ty-return-trip').removeClass('ty-show-b') :
            $('.ty-return-trip').addClass('ty-show-b');
    }

    function tabsCallBackFn() {
        $(this).addClass('active');
        $(this).siblings('.link-wrapper').removeClass('active');
    }

    $('#login-link,#forgotpwd-back').click(openLoginFn);
    $('#register-link').click(openRegisterFn);
    $('#forgot-password-link').click(openForgotPasswordFn);
    $('.user-popup .close').click(closePopupFn);
    $('.search-blk').on('change', 'label input', showCalendarBlkBySelectionFn)
    $('body').on('click', '[data-prevent-default]', function(e) {
        e.preventDefault();
    });

    var isTouchDevice = ('ontouchstart' in window // works on most browsers 
            || navigator.maxTouchPoints),
        imgSlider = $('.image-carousel-blk').unslider({
            autoplay: !isTouchDevice,
            animation: 'fade',
            arrows: false,
            delay: 5000
        });

    if (isTouchDevice) {
        window.addEventListener('load', function() {
            var scripts = [
                'http://stephband.info/jquery.event.move/js/jquery.event.move.js',
                'http://stephband.info/jquery.event.swipe/js/jquery.event.swipe.js'
            ];

            $.getScript(scripts[0]);

            //  Once our script is loaded, we can initSwipe to add swipe support
            $.getScript(scripts[1], function() {
                $('.image-carousel-blk').unslider('initSwipe');
            });
        }, false);
    }

    $('.navigate-links').jqTabs('.search-blk', tabsCallBackFn);

    var fbPromise = $('.user-social.fb').FBSocial(FB_SETTINGS, FB_RTN_SETTINGS);
    fbPromise.then(function(response, meresponse) {
        closePopupFn();
        console.log(response, meresponse);
    });
}(window, jQuery);
