var _tMap = (function (tMap) {
    ('use strict');

    /* TODO: 임시데이터 삭제해야함 */
    tMap._myPositionY = 37.281787642136216 || 0;
    tMap._myPositionX = 127.01519107419634 || 0;
    var useMap = true;

    var location = '';
    var clicker = false;
    var CALL_CURRENT_TIME = 1000 * 5;
    var ERROR_MESSAGE = 0;
    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
    };
    var curMarker = [];
    var curInfo = [];
    var drawInfoArr = [];
    var resultdrawArr = [];

    var currentPosition = function (locate) {
        var infoLoc = new Tmapv2.LatLng(tMap._myPositionY, tMap._myPositionX);
        var loc = new Tmapv2.LatLng(tMap._myPositionY, tMap._myPositionX);
        var info = new Tmapv2.InfoWindow({
            position: infoLoc,
            content: '<div>현재 위치</div>', //Popup 표시될 text
            type: 2, //Popup의 type 설정.
            map: map, //Popup이 표시될 맵 객체
        });

        var marker = new Tmapv2.Marker({
            position: loc,
            map: map,
        });

        if (1 <= curMarker.length) {
            curMarker[0].setMap(null);
            curInfo[0].setMap(null);
            curMarker = [];
            curInfo = [];
        }

        curMarker.push(marker);
        curInfo.push(info);

        map.setCenter(infoLoc || loc);
        marker.setMap(map);
        info.setMap(map);
        map.setZoom(19);
    };

    var onSuccessGeolocation = function (position) {
        if (!!useMap) {
            location = new Tmapv2.LatLng(position.coords.latitude, position.coords.longitude);
        }
        tMap._myPositionY = position.coords.latitude;
        tMap._myPositionX = position.coords.longitude;
        if (!!location && !!clicker) {
            currentPosition(location);
        }
    };

    var onErrorGeolocation = function () {
        tMap._myPositionY = 37.281787642136216;
        tMap._myPositionX = 127.01519107419634;
        console.error('error current position');
        if (ERROR_MESSAGE < 1) {
            alert('내 위치 확인을 위해 사용기기 및 브라우저의 설정에서 "위치정보" 사용을 허용해 주시기 바랍니다.');
            tMap.vibrate();
            ERROR_MESSAGE += 1;
        }
    };

    tMap.agreeGeoLocation = function (func) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(onSuccessGeolocation, onErrorGeolocation, options);
            clicker = false;
        }
        if (typeof func == 'function') {
            setTimeout(function () {
                func();
            }, 500);
        }
    };

    if (!!useMap) {
        var ReplaceStr = [
            'no',
            'imagename',
            'place',
            'address',
            'count',
            'contents',
            'point',
            'title',
            'price',
            'time',
            'area',
            'filename',
            'category',
            'menu',
        ];
        $('.header').stop().hide(0);

        /* 지도 옵션 */
        var mapOptions = {
            center: new Tmapv2.LatLng(tMap._myPositionY, tMap._myPositionX), // 지도 초기 좌표
            width: '100%',
            zoom: 15, // zoom level입니다.  0~19 레벨을 서비스 하고 있습니다.
            zoomControl: true,
            scrollwheel: true,
        };

        var timeId = '';

        /* 지도 객체 */
        var map = new Tmapv2.Map('map', mapOptions);

        var markers = [];

        var allReplace = function ($elm, $clone, arr, data) {
            var $html = $clone.html();
            var text = '';
            var uploadPath = '/upload/' + $clone.attr('data-db') + '/';
            for (var i = 0; i < arr.length; i++) {
                text = '[REPLACE:' + arr[i] + ']';
                if (0 < text.indexOf('filename')) {
                    if (!!data[arr[i]]) {
                        $html = $html.replaceAll(text, uploadPath + data[arr[i]]);
                    } else {
                        $html = $html.replaceAll(text, '/img/spot_bg_01.jpg');
                    }
                }
                if (0 < text.indexOf('imagename')) {
                    if (!!data[arr[i]]) {
                        $html = $html.replaceAll(text, uploadPath + data[arr[i]]);
                    } else {
                        $html = $html.replaceAll(text, '/img/spot_bg_01.jpg');
                    }
                } else {
                    $html = $html.replaceAll(text, data[arr[i]]);
                }
            }
            $elm.empty().append($html);
        };

        var getClickHandler = function (db, seq, name, active, category) {
            return function () {
                var targetName = name;
                var activeImage = '';

                var data = db.filter(function (val) {
                    return val.no === seq;
                });

                if ('event' === name) {
                    activeImage = '/upload/' + name + '/' + active;
                } else if ('conv_parking' === name) {
                    activeImage = '/img/marker/parking_on.png';
                } else if ('conv_toilet' === name) {
                    activeImage = '/img/marker/toilet_on.png';
                } else if ('conv_store' === name) {
                    if ('음식점' === category) {
                        activeImage = '/img/marker/food_on.png';
                    } else if ('카페' === category) {
                        activeImage = '/img/marker/cafe_on.png';
                    } else if ('디저트' === category) {
                        activeImage = '/img/marker/desert_on.png';
                    }
                }

                $('div[title]').each(function () {
                    var $this = $(this).find('img');
                    if ($this.attr('data-src')) {
                        $this.attr('src', $this.attr('data-src'));
                    }
                });

                $('div[title="' + name + seq + '"] img')
                    .eq(0)
                    .attr('data-src', $('div[title="' + name + seq + '"] img').attr('src'))
                    .attr('src', activeImage);

                $('.js-dimmed, .js-popOpen').css('display', 'none');
                $('[data-open="' + targetName + '"]').css('display', 'block');

                var $eventElm = $('[data-append="' + targetName + '"]');
                var $clone = $('[data-db="' + targetName + '"]');

                allReplace($eventElm, $clone, ReplaceStr, data[0]);
            };
        };

        var eventHandler = function () {
            $('.buttons > input').on('click', function (e) {
                e.preventDefault();
                var mapTypeId = this.id;
                if (map.getMapTypeId() !== tMap.MapTypeId[mapTypeId]) {
                    map.setMapTypeId(tMap.MapTypeId[mapTypeId]); // 지도 유형 변경하기
                    $('.buttons > input').removeClass('control-on');
                    $(this).addClass('control-on');
                }
            });

            $('.js-newpage').on('click', function () {
                window.location.reload();
            });

            $('.js-close').on('click', function () {
                $('.popup_wrap').removeClass('on');
            });

            $('.js-dimmed').on('click', function () {
                $('.js-dimmed, .js-popOpen').stop().fadeOut();
            });

            $('.cateNav li a').on('click', function (e) {
                e.preventDefault();
                var $this = $(this);
                var upload = $this.attr('data-name');
                var data = _event;
                if (upload === 'conv_store') {
                    data = _conv_store;
                } else if (upload === 'conv_toilet') {
                    data = _conv_toilet;
                } else if (upload === 'conv_parking') {
                    data = _conv_parking;
                } else if (upload === 'event') {
                    data = _event;
                }
                window.history.pushState({}, document.title, window.location.pathname);
                searchData = null;
                $('.cateNav li a').removeClass('on');
                $('[data-name="' + upload + '"]').addClass('on');
                $('.popup').css('display', 'none');
                tMap.render(data, upload, 'tabmenu');
            });

            $('.js-currentMap').on('click', function (e) {
                tMap.agreeGeoLocation();
                clicker = true;
            });

            document.querySelector('.js-mapType').addEventListener('click', function (e) {
                var id = e.target.getAttribute('data-id');
                if ('SATELLITE' == id) {
                    map.setMapType(Tmapv2.Map.MapType.SATELLITE);
                } else if ('HYBRID' == id) {
                    map.setMapType(Tmapv2.Map.MapType.HYBRID);
                } else if ('ROAD' == id) {
                    map.setMapType(Tmapv2.Map.MapType.ROAD);
                }
            });
        };
    }

    tMap.init = function () {
        eventHandler();
        if (searchResult === 'event') {
            tMap.render(_event, 'event');
        } else if (searchResult === 'store') {
            tMap.render(_conv_store, 'conv_store');
        } else if (searchResult === 'parking') {
            tMap.render(_conv_parking, 'conv_parking');
        } else if (searchResult === 'toilet') {
            tMap.render(_conv_toilet, 'conv_toilet');
        } else {
            tMap.render(_event, 'event', 'tabmenu');
        }
        setInterval(function () {
            tMap.agreeGeoLocation();
        }, CALL_CURRENT_TIME);

        /* TODO : 임시로 여기서 처리.. ㅇ기존에 인덱스랑 푸터에서 호출 */
        tMap.search();
    };

    tMap.vibrate = function () {
        if (!window) {
            return;
        }

        if (!window.navigator) {
            return;
        }

        if (!window.navigator.vibrate) {
            return;
        }

        window.navigator.vibrate([200, 100, 200]);
    };

    tMap.loadingEnd = function (delay) {
        setTimeout(function () {
            $('.loader').addClass('hidden');
            $('#main').addClass('active');
            $('.header').stop().slideDown(300);
        }, delay || 1000 * 0.5);
    };

    tMap.destory = function (markerData) {
        markers = [];
        for (var i = 0; i < markerData.length; i++) {
            markerData[i].setMap(null);
        }
    };

    tMap.render = function (category, upload, isTrigger) {
        $('.cateNav li a').removeClass('on');
        $('.cateNav li a[data-name="' + upload + '"]').addClass('on');

        tMap.loadingEnd();

        var tonenm = new Tmapv2.LatLng(37.281787642136216, 127.01519107419634);
        var mapData = category || [];
        var searchPoint = (!!searchData && new Tmapv2.LatLng(searchData.point.split(',')[0], searchData.point.split(',')[1])) || tonenm;
        tMap.destory(markers);

        if (timeId) {
            clearTimeout(timeId);
        }

        map.setCenter(!!searchData ? searchPoint : tonenm);
        if ('tabmenu' !== isTrigger) {
            map.setZoom(19);
        } else {
            map.setZoom(16);
        }
        if (!!searchData) {
            $('.js-dimmed, .js-popOpen').css('display', 'none');
            $('[data-open="' + upload + '"]').css('display', 'block');
            allReplace($('[data-append="' + upload + '"]'), $('[data-db="' + upload + '"]'), ReplaceStr, searchData);
        }

        timeId = setTimeout(function () {
            for (var i = 0; i < mapData.length; i++) {
                var active = !!mapData[i].imagename_2 ? mapData[i].imagename_2 : '';
                var position =
                    new Tmapv2.LatLng(mapData[i].point.split(',')[0], mapData[i].point.split(',')[1]) ||
                    new Tmapv2.LatLng(tMap._myPositionX, tMap._myPositionY);
                var markerUrl = '';
                var catego = mapData[i].title;
                switch (upload) {
                    case 'conv_parking':
                        markerUrl = '/img/marker/parking.png';
                        break;
                    case 'conv_toilet':
                        markerUrl = '/img/marker/toilet.png';
                        break;
                    case 'conv_store':
                        if ('음식점' === catego) {
                            markerUrl = '/img/marker/food.png';
                        } else if ('카페' === catego) {
                            markerUrl = '/img/marker/cafe.png';
                        } else if ('디저트' === catego) {
                            markerUrl = '/img/marker/desert.png';
                        }
                        break;
                    default:
                        markerUrl = '/upload/' + upload + '/' + mapData[i].imagename;
                        break;
                }
                var marker = new Tmapv2.Marker({
                    map: map,
                    position: position,
                    title: upload + mapData[i].no,
                    animation: Tmapv2.MarkerOptions.ANIMATE_BALLOON,
                    icon: {
                        url: markerUrl || '/upload/' + upload + '/' + mapData[i].imagename || '',
                    },
                    zIndex: 100,
                });
                markers.push(marker);
                markers[i].addEventListener('click', function () {
                    getClickHandler(mapData, mapData[i].no, upload, active, catego);
                });
            }
        }, 1000 * 0.5);
    };

    tMap.drawLine = function (arrPoint) {
        var polyline_;

        polyline_ = new Tmapv2.Polyline({
            path: arrPoint,
            strokeColor: '#DD0000',
            strokeWeight: 6,
            map: map,
        });
        resultdrawArr.push(polyline_);
    };

    tMap.drawRoad = function (startPoint, endPoint, startImage, endImage) {
        /* TODO : startPoint, endPoint,startImage, endImage */
        var startPosition = new Tmapv2.LatLng(37.5668986, 126.97871544);
        // 시작
        var marker_s = new Tmapv2.Marker({
            position: startPosition,
            icon: 'http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_s.png',
            map: map,
        });

        // 도착
        var marker_e = new Tmapv2.Marker({
            position: new Tmapv2.LatLng(37.57081522, 127.00160213),
            icon: 'http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_e.png',
            map: map,
        });

        // 3. 경로탐색 API 사용요청 보행자 경로
        $.ajax({
            method: 'POST',
            url: 'https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json&callback=result',
            async: false,
            data: {
                appKey: 'l7xx9bdd39c31a2745f6a9daff28b6e80513',
                startX: '126.97871544',
                startY: '37.56689860',
                endX: '127.00160213',
                endY: '37.57081522',
                reqCoordType: 'WGS84GEO',
                resCoordType: 'EPSG3857',
                startName: '출발지',
                endName: '도착지',
            },
            success: function (response) {
                var resultData = response.features;

                //결과 출력
                var tDistance = '총 거리 : ' + (resultData[0].properties.totalDistance / 1000).toFixed(1) + 'km,';
                var tTime = ' 총 시간 : ' + (resultData[0].properties.totalTime / 60).toFixed(0) + '분';

                console.log(tDistance + tTime);

                //기존 그려진 라인 & 마커가 있다면 초기화
                if (resultdrawArr.length > 0) {
                    for (var i in resultdrawArr) {
                        resultdrawArr[i].setMap(null);
                    }
                    resultdrawArr = [];
                }
                drawInfoArr = [];

                for (var i in resultData) {
                    //for문 [S]
                    var geometry = resultData[i].geometry;
                    var properties = resultData[i].properties;

                    if (geometry.type == 'LineString') {
                        for (var j in geometry.coordinates) {
                            // 경로들의 결과값(구간)들을 포인트 객체로 변환
                            var latlng = new Tmapv2.Point(geometry.coordinates[j][0], geometry.coordinates[j][1]);
                            // 포인트 객체를 받아 좌표값으로 변환
                            var convertPoint = new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(latlng);
                            // 포인트객체의 정보로 좌표값 변환 객체로 저장
                            var convertChange = new Tmapv2.LatLng(convertPoint._lat, convertPoint._lng);
                            // 배열에 담기
                            drawInfoArr.push(convertChange);
                        }
                    } else {
                        var markerImg = '';
                        var pType = '';
                        var size;

                        if (properties.pointType == 'S') {
                            //출발지 마커
                            markerImg = 'http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_s.png';
                            pType = 'S';
                        } else if (properties.pointType == 'E') {
                            //도착지 마커
                            markerImg = 'http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_e.png';
                            pType = 'E';
                        } else {
                            //각 포인트 마커
                            markerImg = 'http://topopen.tmap.co.kr/imgs/point.png';
                            pType = 'P';
                            size = new Tmapv2.Size(8, 8);
                        }

                        // 경로들의 결과값들을 포인트 객체로 변환
                        var latlon = new Tmapv2.Point(geometry.coordinates[0], geometry.coordinates[1]);

                        // 포인트 객체를 받아 좌표값으로 다시 변환
                        var convertPoint = new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(latlon);

                        var routeInfoObj = {
                            markerImage: markerImg,
                            lng: convertPoint._lng,
                            lat: convertPoint._lat,
                            pointType: pType,
                        };

                        // Marker 추가
                        var marker_p = new Tmapv2.Marker({
                            position: new Tmapv2.LatLng(routeInfoObj.lat, routeInfoObj.lng),
                            icon: routeInfoObj.markerImage,
                            iconSize: size,
                            map: map,
                        });
                    }
                }

                map.setCenter(startPosition);
                map.setZoom(18);
                tMap.drawLine(drawInfoArr);
            },
            error: function (request, status, error) {
                console.log('code:' + request.status + '\n' + 'message:' + request.responseText + '\n' + 'error:' + error);
            },
        });
    };

    tMap.search = function () {
        // var autoWords = function ($selector) {
        //     $($selector).on('focus', function () {
        //         $($selector + 'Cord').val('');
        //         $(this).autocomplete('search');
        //     });
        //     $($selector).autocomplete({
        //         minLength: 0,
        //         autoFocus: true,
        //         delay: 200,
        //         disable: false,
        //         source: _searchData,
        //         focus: function (event, ui) {
        //             return false; //한글 에러 잡기용도로 사용됨
        //         },
        //         select: function (event, ui) {
        //             $($selector + 'Cord').val(ui.item.point);
        //         },
        //     });
        // };

        // autoWords('.js-start');
        // autoWords('.js-end');
        // autoWords('.js-search');

        /* 길찾기 네비게이션 폼 리셋 */
        $('.js-reset').on('click', function () {
            $('.js-start, .js-end').val('');
            $('.js-startCord, .js-endCord').val('');
            $('.js-start').focus();
        });

        /* 길찾기 */
        $('.js-road').on('click', function () {
            // TODO : 서치폼에서 (좌측 네비게이션 바) 직접 고른 좌표로 선 그어주기
            var startText = $('.js-start').val();
            var endText = $('.js-end').val();
            var startCord = $('.js-startCord').val();
            var endCord = $('.js-endCord').val();
            if (startCord === '' || endCord === '') {
                alert('출발지 및 도착지를 입력해주세요.');
                if (startCord === '') {
                    $('.js-start').focus();
                    return;
                } else {
                    $('.js-end').focus();
                    return;
                }
            }
            /* TODO: 선으로 길찾기  */
        });
        $(document).on('click', '.js-eventRoad', function () {
            var $this = $(this);
            var name = $this.attr('data-name'); // 이름(필요없을 듯)
            var cord = $this.attr('data-road'); // 좌표 (길찾기의 엔드포인트가 되겠군 <현재지점에서부터 엔드포인트 까지>)
            tMap.drawRoad();
            /* TODO: 선으로 길찾기 (다른 뷰페이지에서도 넘어와야함 파라미터값으로 보내야겠지?) */
        });
    };

    return tMap;
})(window._tMap || {});
