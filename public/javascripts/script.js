window.onload = function() {
    var keyCode;
    var openRecordBut = document.querySelector('.record-container');
    var inputTel = document.querySelector('#tel');
    var emailBlurMessage = 'Вводить email необязательно, но если Вы его оставите, то получите подтвереждение на почту!';
    var emailTip = document.querySelector('.email-tip');
    var calendar = document.querySelector('.calendar');
    var myformSubmit = document.querySelector('.myformSubmit');
    var customerName = document.querySelector('#fio');
    var customerPhone = document.querySelector('#tel');
    var emailField = document.querySelector('#email');
    var nextButton = document.querySelector('.next');
    var calendarCells = document.getElementsByClassName('cell');
    var serviceSelect = document.querySelector('.service-select');
    var serviceDuration = {
        /*
        **
            1 = 30 min
        **
        */
        manikur: 1,
        manikurCover: 2,
        manikurDesign: 3,
        manikurPedikur: 6,
        pedikur: 2
    };

    var session = new Object();
    session.offset = 2;

    /**
     * 
     * @param {string } method метод запроса get/post
     * @param {string} url  урл запроса
     * @param {object} object  тело запроса для post
     * @param {function} cb  колбэк функция
     */
    function sendRequest(method, url, object, cb) {
        if (object !== false) {
            var xhr = new XMLHttpRequest();


            xhr.open(method, url, true);
            xhr.setRequestHeader("Content-Security-Policy", "upgrade-insecure-requests");
            xhr.onload = function() {
                if (xhr.status != 200) {
                    // анализируем HTTP-статус ответа, если статус не 200, то произошла ошибка
                    console.log("\u041E\u0448\u0438\u0431\u043A\u0430 ".concat(xhr.status, ": ").concat(xhr.statusText)); // Например, 404: Not Found
                } else {
                    // если всё прошло гладко, выводим результат
                    console.log("\u0413\u043E\u0442\u043E\u0432\u043E, \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u0438 ".concat(xhr.response.length, " \u0431\u0430\u0439\u0442")); // response -- это ответ сервера

                    cb(xhr.response);
                }
            };

            if (method === 'post') {
                xhr.setRequestHeader("Content-Type", "application/json");
            }

            xhr.send(object);
        } else {
            alert('Что-то пошло не так', object);
        }
    }

    /**
     * Функция возвращает все ячейки 
     * календаря на текущий день
     */
    function getTodayCells() {
        var todayCells = new Array();
        for (var i = 0; i < calendarCells.length; i++) {

            if (calendarCells[i].dataset.day === session.todayDate) {
                todayCells.push(calendarCells[i]);
            }
        }
        return todayCells;
    }

    /**
     * @param {string} string текущее время
     * @param {number} offset офсет - глобальный параметр 
     * Возвращает время с учетом офсета, для блокировки ячеек текущего дня
     */

    function offsetCount(string, offset) {
        var replace_part = string[0] + string[1];
        var new_part = Number(replace_part) + offset; //for example 24
        var new_string = string.replace(replace_part, new_part);

        if (new_string.length === 4) {
            new_string = "0" + new_string;
        }

        if (new_string > '24:00') {
            new_string = '24:00';
        }
        return new_string;
    }

    /**
     * Возвращает забронированные ячейки из базы, путем гет запроса на сервер.
     */
    function getBusySlots() {
        sendRequest('get', '/getbusycalendar', null, function(response) {
            response = JSON.parse(response);
            getSameDayCells('array_mode', response);
        });
    }

    /**
     * 
     * @param {object*} session обьект текущей сессии пользователя
     * Помечает ячейки (забронированные и с учетом офсета) как неактивные 
     * для выбора (бронирования) пользователем.
     */
    function hideInactiveSlots(session) {
        var todaySlots = getTodayCells();
        if (session.currentTime > '21:30') {
            for (var i = 0; i < todaySlots.length; i++) {
                todaySlots[i].classList.add('inactive');
            }
        }
        for (var i = 0; i < todaySlots.length; i++) {
            if (todaySlots[i].dataset.hour <= offsetCount(session.currentTime, session.offset)) {
                todaySlots[i].classList.add('inactive');
            }
        }
    }


    /**
     * 
     * @param {function} cb колбэк функция
     * Функция возвращает в колбэке объект с данными, пример:
     * {"week":["tuesday","wednesday","thursday","friday","saturday","sunday","monday","tuesday"],"time":"16:35","todayDate":"26.11"}
     * Используется для отображения на фронте и для расчета заблокированных ячеек
     */
    function getCurrentWeekArray(cb) {
        var weekArr = sendRequest('get', '/getdatafront', null, function(response) {
            cb(JSON.parse(response));
        });
    }

    /**
     * 
     *  @param {object*} session обьект текущей сессии пользователя
     *  Функция подготавливает данные для отправки на сервер и осуществления регистрации события
     *  Возвращает JSON с подготовленными данными.
     * 
     */

    function prepareData(session) {
        if (session.selectedElements.length >= 1) {
            session.customerName = customerName.value;
            session.customerPhone = customerPhone.value;
            session.email = emailField.value;
            session.period = [];
            session.periodEndData = [];
            session.date = session.selectedElements[0].dataset.day;
            for (i = 0; i < session.selectedElements.length; i++) {
                var periodFirstTimeSlot = session.selectedElements[i].dataset.hour;
                var endperiod = session.selectedElements[i].dataset.timeslotend;
                session.period.push(periodFirstTimeSlot);
                session.periodEndData.push(endperiod);
            }
            return JSON.stringify(session);
        } else {
            return false;
        }
    }

    /**
     * 
     * @param {array} selected_elements список выбранных элементов
     * Функция возвращает boolean
     * True если переданные элементы содержат в себе неактивные
     * False если нет
     */
    function inactiveSlotsSelectDetecetion(selected_elements) {
        for (var i = 0; i < selected_elements.length; i++) {
            if (selected_elements[i].classList.contains('inactive')) {
                return true;
            }
        }
        return false;
    }

    /**
     * 
     * @param {object*} session обьект текущей сессии пользователя
     * @param {function} cb колбэк функция
     * Функия возвращает в колбэке статус проверки ячеек на обеденное время.
     */
    function lunchDetection(session, cb) {
        //chek if selected cells not avalaible to select
        if (inactiveSlotsSelectDetecetion(session.selectedElements)) {
            return cb('slot is inactive');
        } else {
            for (i = 0; i < session.selectedElements.length; i++) {
                if ((i + 1) === session.selectedElements.length) {
                    return cb('ok');
                }
                if (session.selectedElements[i].dataset.hour === '11:30' && session.selectedElements[(i + 1)].dataset.hour === '14:00') {
                    return cb('obed');
                }
            }
        }
    }

    /**
     * Функция очищает выбранные элементы (ячейки)
     * Возвращает пустой массив
     */
    function clearIfAnotherCellsSelected() {
        var selectedElements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

        for (i = 0; i < selectedElements.length; i++) {
            selectedElements[i].classList.remove('selected-time-slot');
        }

        selectedElements = [];
        return selectedElements;
    }

    /**
     * 
     * @param {string} mode  html коллекция или массив таймслотов
     * @param {array} obj in dependency of mode : element obj(in case of inactive slots by time) 
     * or timeslots array from  GET /getbusycalendar (in case of check already busy slots)
     * reparing array with time slots by day to select
     */
    function getSameDayCells(mode, obj) {

        var sameday_cells_arr = new Array();

        if (mode === 'element_mode') {
            for (var i = 0; i < calendarCells.length; i++) {
                if (calendarCells[i].dataset.day === obj.dataset.day) {
                    sameday_cells_arr.push(calendarCells[i]);
                }
            }
        } else if (mode === 'array_mode') {
            for (var o = 0; o < obj.length; o++) {
                for (var i = 0; i < obj[o].timeslot.length; i++) {
                    if (document.querySelectorAll("[data-day=\"".concat(obj[o].date, "\"][ data-hour=\"").concat(obj[o].timeslot[i], "\"]"))[0]) {
                        document.querySelectorAll("[data-day=\"".concat(obj[o].date, "\"][ data-hour=\"").concat(obj[o].timeslot[i], "\"]"))[0].classList.add('inactive');
                    }

                    ;
                }
            }
        }

        return sameday_cells_arr;
    }

    /**
     * 
     * @param {object} element html элемент
     * @param {Number} serviceDuration  количество единиц времени х 30 минут пер юнит
     * Осуществляет фактический выбор ячеек по клику\тачу
     */

    function chooseCellsByServiceDuration(element, serviceDuration) {
        //clear if another cells selected
        session.selectedElements = clearIfAnotherCellsSelected(session.selectedElements);
        var sameday_cells_arr = getSameDayCells('element_mode', element);

        for (var i = 0; i < sameday_cells_arr.length; i++) {
            if (sameday_cells_arr[i].dataset.hour === element.dataset.hour) {
                for (var k = 0; k < serviceDuration; k++) {
                    session.selectedElements.push(sameday_cells_arr[i + k]);
                }
            }
        }
        lunchDetection(session, function(status) {
            if (status === 'ok') {
                //selecting time slots with css
                for (i = 0; i < session.selectedElements.length; i++) {
                    session.selectedElements[i].classList.add('selected-time-slot');
                }
            } else if (status === 'obed') {
                alert('ОБЕД');
                //clear time slots because of lunch break;
                session.selectedElements = clearIfAnotherCellsSelected(session.selectedElements);
            } else if (status === 'slot is inactive') {
                alert('Невозможно выбрать данное время');
            }
        });
        return;
    }

    /**
     * 
     * @param {object} e элемент html
     * Вызывает функцию chooseCellsByServiceDuration в зависимости от выбранного пользователем service в select
     */
    function selectCell(e) {
        switch (session.service) {
            case 'manikur':
                session.duration = serviceDuration.manikur;
                chooseCellsByServiceDuration(e.target, session.duration);
                break;
            case 'manikurCover':
                session.duration = serviceDuration.manikurCover
                chooseCellsByServiceDuration(e.target, session.duration);
                break;
            case 'manikurDesign':
                session.duration = serviceDuration.manikurDesign;
                chooseCellsByServiceDuration(e.target, session.duration);
                break;
            case 'manikurPedikur':
                session.duration = serviceDuration.manikurPedikur;
                chooseCellsByServiceDuration(e.target, session.duration);
                break;
            case 'pedikur':
                session.duration = serviceDuration.pedikur;
                chooseCellsByServiceDuration(e.target, session.duration);
                break;
        }
        return;
    }


    /**
     * 
     * @param {string} message сообщение при вводе данных
     * Осуществляет вызов сообщения в сулчае фокуса на инпут с email
     */
    function showEmailTip(message) {
        emailTip.innerHTML = message;
        emailTip.style.display = 'block';
        return;
    }

    /**
     * Осуществляет скрытия сообщения в сулчае разфокуса на инпут с email
     */

    function hideEmailTip() {
        emailTip.style.display = 'none';
        return;
    }

    /**
     * Изменяет строку ввода имени таким образом, чтобы первая буква становилась заглавной
     */
    function upperName() {
        var uppedName = customerName.value.charAt(0).toUpperCase();
        for (i = 1; i < customerName.value.length; i++) {
            uppedName = uppedName + customerName.value[i];
        }
        customerName.value = uppedName;
        console.log(uppedName)
        return;
    }

    /**
     * 
     * @param {function} callback колбэк функция
     * Осуществляет проверку полей на заполнение данными
     */

    function fieldsChecked(callback) {
        var customerNameValue = customerName.value;
        var customerPhoneValue = customerPhone.value;
        if (customerPhoneValue.length === 17 && customerNameValue.length > 0) {
            callback(true);
        } else if (customerPhoneValue.length < 17 && customerNameValue.length > 0) {
            callback('phone');
        } else {
            callback(false);
        }
        return;
    };

    /**
     * Функция скрывает открытый календарь бронирования
     */
    function hideCalendar() {
        calendar.style.display = 'block';
        myformSubmit.style.display = 'block';
        return;
    }

    /**
     * Функция отображает календарь бронирования в случае успешной проверки fieldsChecked();
     */
    function showCalendar() {
        fieldsChecked(function(status) {
            switch (status) {
                case true:
                    session.service = serviceSelect.value;
                    calendar.style.display = 'block';
                    myformSubmit.style.display = 'block';
                    break;
                case false:
                    alert('Пожалуйста, введите номер телефона и Ваше имя.');
                    break;
                case 'phone':
                    alert('Пожалуйста, введите номер телефона полностью.');
                    break;
            };
        });
    };

    /**
     * 
     * @param {*} event 
     * Функция маскирования телефонного номера в инпуте
     */
    function mask(event) {
        event.keyCode && (keyCode = event.keyCode);
        var pos = this.selectionStart;
        if (pos < 3) event.preventDefault();
        var matrix = "+7 (___) ___ ____",
            i = 0,
            def = matrix.replace(/\D/g, ""),
            val = this.value.replace(/\D/g, ""),
            new_value = matrix.replace(/[_\d]/g, function(a) {
                return i < val.length ? val.charAt(i++) || def.charAt(i) : a
            });
        i = new_value.indexOf("_");
        if (i != -1) {
            i < 5 && (i = 3);
            new_value = new_value.slice(0, i)
        }
        var reg = matrix.substr(0, this.value.length).replace(/_+/g,
            function(a) {
                return "\\d{1," + a.length + "}"
            }).replace(/[+()]/g, "\\$&");
        reg = new RegExp("^" + reg + "$");
        if (!reg.test(this.value) || this.value.length < 5 || keyCode > 47 && keyCode < 58) this.value = new_value;
        if (event.type == "blur" && this.value.length < 5) this.value = ""
    }

    /**
     * Функция вызова формы ввода данных
     */
    function openRecord() {
        document.getElementsByClassName('customer_data')[0].style.display = "block";
    };

    /**
     * Назначение слушаталей событий для html элементов
     */
    emailField.onfocus = function() {
        showEmailTip(emailBlurMessage);
    };
    emailField.onblur = function() {
        hideEmailTip();
    };

    (function() {
        getBusySlots();
        getCurrentWeekArray(function(response) {
            session.weekArr = response.week;
            session.currentTime = response.time;
            session.todayDate = response.todayDate;
            hideInactiveSlots(session);
        });
        for (i = 0; i < calendarCells.length; i++) {
            calendarCells[i].addEventListener('ontouchend', selectCell);
            calendarCells[i].addEventListener('click', selectCell);
        }
    })();

    customerName.addEventListener("blur", upperName);
    openRecordBut.addEventListener('click', openRecord);
    openRecordBut.addEventListener('ontouchend', openRecord);
    nextButton.addEventListener('click', showCalendar);
    nextButton.addEventListener('ontouchend', showCalendar);
    inputTel.addEventListener("input", mask, false);
    inputTel.addEventListener("focus", mask, false);
    inputTel.addEventListener("blur", mask, false);
    inputTel.addEventListener("keydown", mask, false);
    document.getElementsByClassName("record")[0].addEventListener("submit", function(e) {
        e.preventDefault();
        sendRequest('post', '/registration', prepareData(session), function(response) {
            alert(response);
            session.selectedElements = clearIfAnotherCellsSelected(session.selectedElements);
            document.location.reload(true);
        });
    });

    var vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', "".concat(vh, "px"));
}