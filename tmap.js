var _tMap = (function (tMap) {
    ('use strict');

    /* TODO: 임시데이터 삭제해야함 */
    var _myPositionY = 37.2820716;
    var _myPositionX = 127.0123522;

    // TODO: 테스트
    var useMap = true;

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
            center: new Tmapv2.LatLng(37.566481622437934, 126.98502302169841), // 지도 초기 좌표
            width: '100%',
            // height: '400px',
            zoom: 15, // zoom level입니다.  0~19 레벨을 서비스 하고 있습니다.
            zoomControl: true,
            scrollwheel: true,
        };
        var timeId = '';

        /* 지도 객체 */
        var map = new Tmapv2.Map('map', mapOptions);

        var markers = [];
        var loadCurrentPosition = 0;
        var location = '';

        var infoWindow = '';

        var onSuccessGeolocation = function (position) {
            if (loadCurrentPosition < 1) {
                location = new Tmapv2.LatLng(position.coords.latitude, position.coords.longitude);
                loadCurrentPosition++;
            }

            if (!location) {
                location = new Tmapv2.LatLng(position.coords.latitude, position.coords.longitude);
            }

            map.setCenter(location);
            map.setZoom(19);
            infoWindow = new Tmapv2.InfoWindow({
                position: location,
                content: '<div style="padding:20px; margin-bottom:30px">' + '현재 위치' + '</div>',
                border: '0px solid #FF0000', //Popup의 테두리 border 설정.
                type: 2, //Popup의 type 설정.
                map: map, //Popup이 표시될 맵 객체
            });
            console.log('Coordinates: ' + location.toString());
        };

        var onErrorGeolocation = function () {
            console.error('error current position');
        };

        // var updateMarkers = function (maps, markerInfo) {
        //     var mapBounds = maps.getBounds();
        //     var marker, position;

        //     for (var i = 0; i < markerInfo.length; i++) {
        //         marker = markerInfo[i];
        //         position = marker.getPosition();

        //         if (mapBounds.hasLatLng(position)) {
        //             showMarker(maps, marker);
        //         } else {
        //             hideMarker(maps, marker);
        //         }
        //     }
        // };

        // var showMarker = function (maps, marker) {
        //     if (marker.setMap()) return;
        //     marker.setMap(maps);
        // };

        // var hideMarker = function (maps, marker) {
        //     if (!marker.setMap()) return;
        //     marker.setMap(null);
        // };

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

        // 해당 마커의 인덱스를 seq라는 클로저 변수로 저장하는 이벤트 핸들러를 반환합니다.
        var getClickHandler = function (db, seq, name, active) {
            return function () {
                var targetName = name;

                var data = db.filter(function (val) {
                    return val.no === seq;
                });

                $('.js-markersActiver').each(function () {
                    var $this = $(this);
                    if ($this.attr('data-src')) {
                        $this.attr('src', $this.attr('data-src'));
                    }
                });

                $('.js-' + seq)
                    .eq(0)
                    .attr('data-src', $('.js-' + seq).attr('src'))
                    .attr('src', '/upload/' + name + '/' + active);

                $('.js-dimmed, .js-popOpen').css('display', 'none');
                $('[data-open="' + targetName + '"]').css('display', 'block');

                var $eventElm = $('[data-append="' + targetName + '"]');
                var $clone = $('[data-db="' + targetName + '"]');

                allReplace($eventElm, $clone, ReplaceStr, data[0]);
            };
        };

        var agreeGeoLocation = function () {
            // var loc = new Tmapv2.LatLng(_myPositionY, _myPositionX);
            // var infoLoc = new Tmapv2.LatLng(_myPositionY + 0.0001, _myPositionX);
            // var marker = new Tmapv2.Marker({
            //     position: loc,
            //     map: map,
            // });
            // map.setCenter(loc);
            // infoWindow.setContent('<div style="padding:20px;">현재 위치(임시, 가짜)</div>');
            // infoWindow.open(map, infoLoc);
            // marker.setMap(map);
            // map.setZoom(19);
            // return;

            if (navigator.geolocation) {
                if (loadCurrentPosition < 1) {
                    navigator.geolocation.getCurrentPosition(onSuccessGeolocation, onErrorGeolocation);
                    return;
                }
                onSuccessGeolocation(location);
            } else {
                var center = map.getCenter();
                infoWindow.setContent('<div style="padding:20px;"><h5 style="margin-bottom:5px;color:#f00;">Geolocation not supported</h5></div>');
                infoWindow.open(map, center);
            }
        };

        var eventHandler = function () {
            $('.buttons > input').on('click', function (e) {
                e.preventDefault();
                var mapTypeId = this.id;
                if (map.getMapTypeId() !== naver.maps.MapTypeId[mapTypeId]) {
                    map.setMapTypeId(naver.maps.MapTypeId[mapTypeId]); // 지도 유형 변경하기
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
                agreeGeoLocation();
            });

            /* 지도 커스텀 스타일 */
            $(window).on('load', function () {
                $('#map > div:nth-of-type(2)').addClass('flex');
                /* 배율 */
                $('#map > div:nth-of-type(2) > div:nth-of-type(1)').addClass('map_range');
                /* logo remove */
                $('#map > div:nth-of-type(2) > div:nth-of-type(2)').remove();
                /* 지형도 */
                $('#map > div:nth-of-type(2) > div:nth-of-type(2)').addClass('map_type');
                /* 줌 */
                $('#map > div:nth-of-type(2) > div:nth-of-type(3)').addClass('map_zoom');
            });

            naver.maps.Event.addListener(map, 'idle', function () {
                updateMarkers(map, markers);
                console.log('지도 움직임');
            });
        };
    }

    var movePosition = function (text, loc, zoom) {
        map.setCenter(loc);
        map.setZoom(zoom || 17);
    };

    var deg2rad = function (deg) {
        return deg * (Math.PI / 180);
    };

    // distance 계산
    var getDistanceFromLatLonInKm = function (lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1); // deg2rad below
        var dLon = deg2rad(lon2 - lon1);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    };

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
        // agreeGeoLocation();
    };

    tMap.loadingEnd = function (delay) {
        setTimeout(function () {
            $('.loader').addClass('hidden');
            $('#main').addClass('active');
            $('.header').stop().slideDown(300);
        }, delay || 1000 * 0.5);
    };

    tMap.openUrl = function (startCord, endCord, startText, endText, type) {
        if (!startCord || !endCord || !startText || !endText) return;
        var startX = startCord.split(',')[1] * 1;
        var startY = startCord.split(',')[0] * 1;
        var endX = endCord.split(',')[1] * 1;
        var endY = endCord.split(',')[0] * 1;
        var distance = getDistanceFromLatLonInKm(startX, startY, endX, endY);
        var traffic;
        var trafficType;
        if (distance < 3) {
            if (distance < 1) {
                traffic = 3;
            } else {
                traffic = 1;
            }
        } else {
            traffic = 0;
        }
        trafficType = typeof type !== 'undefined' ? type : traffic;

        var url = 'http://map.naver.com/index.nhn?slng=';
        url += startX;
        url += '&slat=' + startY;
        url += '&stext=' + startText + '&elng=' + endX;
        url += '&elat=' + endY + '&etext=' + endText + '&menu=route&pathType=' + trafficType;

        window.open(url);
    };

    tMap.destory = function (markerData) {
        markers = [];
        for (var i = 0; i < markerData.length; i++) {
            markerData[i].setMap(null);
        }
    };

    function drawLine(arrPoint) {
        var polyline_;

        polyline_ = new Tmapv2.Polyline({
            path: arrPoint,
            strokeColor: '#DD0000',
            strokeWeight: 6,
            map: map,
        });
        resultdrawArr.push(polyline_);
    }
    var marker_s, marker_e, marker_p1, marker_p2;
    var totalMarkerArr = [];
    var drawInfoArr = [];
    var resultdrawArr = [];

    function initTmap() {
        // 2. 시작, 도착 심볼찍기
        // 시작
        marker_s = new Tmapv2.Marker({
            position: new Tmapv2.LatLng(37.5668986, 126.97871544),
            icon: 'http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_s.png',
            iconSize: new Tmapv2.Size(24, 38),
            map: map,
        });

        // 도착
        marker_e = new Tmapv2.Marker({
            position: new Tmapv2.LatLng(37.57081522, 127.00160213),
            icon: 'http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_e.png',
            iconSize: new Tmapv2.Size(24, 38),
            map: map,
        });

        // 3. 경로탐색 API 사용요청
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

                alert(tDistance + tTime);

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
                    var polyline_;

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
                            size = new Tmapv2.Size(24, 38);
                        } else if (properties.pointType == 'E') {
                            //도착지 마커
                            markerImg = 'http://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_e.png';
                            pType = 'E';
                            size = new Tmapv2.Size(24, 38);
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
                        marker_p = new Tmapv2.Marker({
                            position: new Tmapv2.LatLng(routeInfoObj.lat, routeInfoObj.lng),
                            icon: routeInfoObj.markerImage,
                            iconSize: size,
                            map: map,
                        });
                    }
                } //for문 [E]
                drawLine(drawInfoArr);

                /* TODO: 현 위치 테스트 */
                agreeGeoLocation();
            },
            error: function (request, status, error) {
                console.log('code:' + request.status + '\n' + 'message:' + request.responseText + '\n' + 'error:' + error);
            },
        });
    }
    initTmap();

    tMap.render = function (category, upload, isTrigger) {
        $('.cateNav li a').removeClass('on');
        $('.cateNav li a[data-name="' + upload + '"]').addClass('on');

        tMap.loadingEnd();

        var mapData = category || [];
        var firstPosition = new Tmapv2.LatLng(mapData[0].point.split(',')[0], mapData[0].point.split(',')[1]) || new Tmapv2.LatLng(_myPositionX, _myPositionY);
        var tonenm = new Tmapv2.LatLng(37.2808757, 127.0140568);
        var currentPosition = new Tmapv2.LatLng(_myPositionY, _myPositionX);
        var searchPoint = !!searchData ? new Tmapv2.LatLng(searchData.point.split(',')[0], searchData.point.split(',')[1]) : firstPosition;
        tMap.destory(markers);

        if (timeId) {
            clearTimeout(timeId);
        }

        timeId = setTimeout(function () {
            for (var i = 0; i < mapData.length; i++) {
                var active = !!mapData[i].imagename_2 ? mapData[i].imagename_2 : '';
                var position =
                    new Tmapv2.LatLng(mapData[i].point.split(',')[0], mapData[i].point.split(',')[1]) || new Tmapv2.LatLng(_myPositionX, _myPositionY);
                var marker = new Tmapv2.Marker({
                    map: map,
                    position: position,
                    title: mapData[i].title,
                    icon: '/upload/' + upload + '/' + mapData[i].imagename,
                    // iconSize: new naver.maps.Size(135, 135),
                });

                // var infoWindow = new naver.maps.InfoWindow({
                //     content: '<div style="width:150px;text-align:center;padding:10px;">' + mapData[i].title + '</div>'
                // });
                // infoWindows.push(infoWindow);
                map.setCenter(!!searchData ? searchPoint : tonenm);
                markers.push(marker);
                if ('tabmenu' !== isTrigger) {
                    map.setZoom(30);
                } else {
                    map.setZoom(17);
                }

                naver.maps.Event.addListener(markers[i], 'click', getClickHandler(mapData, mapData[i].no, upload, active));

                if (!!searchData) {
                    $('.js-dimmed, .js-popOpen').css('display', 'none');
                    $('[data-open="' + upload + '"]').css('display', 'block');
                    allReplace($('[data-append="' + upload + '"]'), $('[data-db="' + upload + '"]'), ReplaceStr, searchData);
                }
            }
        }, 1000 * 0.5);
    };

    tMap.search = function () {
        var autoWords = function ($selector) {
            $($selector).on('focus', function () {
                $($selector + 'Cord').val('');
                $(this).autocomplete('search');
            });
            $($selector).autocomplete({
                minLength: 0,
                autoFocus: true,
                delay: 200,
                disable: false,
                source: _searchData,
                // source: function (request, response) {
                //     var results = $.ui.autocomplete.filter(_searchData, request.term);
                //     // response(results.slice(0, 10));
                // },
                focus: function (event, ui) {
                    return false; //한글 에러 잡기용도로 사용됨
                },
                select: function (event, ui) {
                    $($selector + 'Cord').val(ui.item.point);
                },
            });
        };

        autoWords('.js-start');
        autoWords('.js-end');
        autoWords('.js-search');

        $('.js-reset').on('click', function () {
            $('.js-start, .js-end').val('');
            $('.js-startCord, .js-endCord').val('');
            $('.js-start').focus();
        });

        /* 길찾기 */
        $('.js-road').on('click', function () {
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
            if (0 < endText.indexOf('주차장')) {
                tMap.openUrl(startCord, endCord, startText, endText, 0);
            } else {
                tMap.openUrl(startCord, endCord, startText, endText);
            }
        });

        $(document).on('click', '.js-eventRoad', function () {
            var $this = $(this);
            var name = $this.attr('data-name');
            var cord = $this.attr('data-road');

            if (0 < name.indexOf('주차장')) {
                tMap.openUrl(_myPositionY + ',' + _myPositionX, cord, '현위치', name, 0);
            } else {
                tMap.openUrl(_myPositionY + ',' + _myPositionX, cord, '현위치', name);
            }
        });

        /* 검색 */
        // $('.searchBtn input').on('click', function () {
        //     movePosition();
        // });

        // $('.js-search').on('keydown', function (event) {
        //     if (event.key === 13) {
        //         movePosition();
        //     }
        // });
    };

    return tMap;
})(window._tMap || {});
