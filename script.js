// ==UserScript==
// @name         自动填充表单（使用随机用户信息）
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  自动填充表单，并使用随机用户信息进行填写（仅当存在包含地址信息的注册表单时显示确认提示）
// @author       VPSLOG
// @match        http://*/*
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 修改为需要的随机数位数
    var randomDigits=4
    // 修改为邮箱域名
    var emailSuffix='outlook.com'

    //
    // 下面不要动
    //

    // 检查 localStorage 是否已有关闭状态
    if (localStorage.getItem('noclickClosed') === 'true') {
        console.log("UI has been closed previously. Exiting...");
        return;  // 如果已关闭过，跳过执行
    }

    window.addEventListener('load', () => {
        const formCheck = setInterval(() => {
            const addressField = document.querySelector('input[name*="address"]');
            if (addressField) {
                clearInterval(formCheck); // 停止定时器
                injectStyles();
                injectInputForm(addressField.closest('form')); // 执行自动填充函数
            }
        }, 2000);
    });

    // 注入样式
    function injectStyles() {
        var style = document.createElement('style');
        style.innerHTML = `
        #floatingInputContainer {
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 10px;
            background-color: #fff;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            border-radius: 8px;
            width: 250px;
            box-sizing: border-box;
        }

        #floatingInputContainer label {
            font-size: 14px;
            margin-bottom: 2px;
            display: block;
        }

        #floatingInputContainer input, #floatingInputContainer button {
            width: 100%;
            padding: 8px;
            margin-bottom: 4px;
            border-radius: 4px;
            border: 1px solid #ccc;
            box-sizing: border-box;
            line-height: 1.2;
        }

        #closeButton {
            background-color: gray;
        }

        #executeButton {
            background-color: #007bff;
        }

        #floatingInputContainer button {
            margin-top: 8px;
            color: white;
            border: none;
        }

        #floatingInputContainer .button-container {
            display: flex;
            justify-content: space-between;
            gap: 10px;
        }
        `;
        document.head.appendChild(style);
    }

    // 注入输入框和按钮
    function injectInputForm(form) {
        var formHTML = `
        <div id="floatingInputContainer">
            <div class="header-links">自动表单填充 BY VPSLOG<br/><a href="https://github.com/vpslog/vps-stock-monitor" target="_blank"><i class="fab fa-github">&nbsp; Github</i><!-- GitHub 图标 --></a>&nbsp;&nbsp;<a href="https://t.me/vpalognet" target="_blank"><i class="fab fa-telegram-plane">&nbsp; Telegram 频道</i><!-- Telegram 图标 --></a></div>
            <div class="button-container">
                <button id="executeButton">填写</button>
                <button id="closeButton">关闭</button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', formHTML);

        // 关闭按钮逻辑
        const closeButton = document.getElementById('closeButton');
        closeButton.addEventListener('click', () => {
            localStorage.setItem('noclickClosed', 'true');
            document.getElementById('floatingInputContainer').remove();
        });

        // 执行按钮逻辑
        const executeButton = document.getElementById('executeButton');
        executeButton.addEventListener('click', () => {
            fetch('https://randomuser.me/api?nat=us')
                .then(response => response.json())
                .then(data => {
                    const user = data.results[0];
                    fillForm(form, user);
                    document.getElementById('floatingInputContainer').remove();
                })
                .catch(error => console.log(error));
        });
    }


    // 生成指定位数的随机数
    function generateRandomNumber(digits) {
        const min = Math.pow(10, digits - 1);  // 最小值（例如，4位数最小值为1000）
        const max = Math.pow(10, digits) - 1;  // 最大值（例如，4位数最大值为9999）
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function fillForm(form, user) {
        const firstNameInput = form.querySelector('input[name="firstname"]');
        if (firstNameInput && !firstNameInput.value) {
            firstNameInput.value = user.name.first;
        }

        const lastNameInput = form.querySelector('input[name="lastname"]');
        if (lastNameInput && !lastNameInput.value) {
            lastNameInput.value = user.name.last;
        }

        const emailInput = form.querySelector('input[name="email"]');
        if (emailInput && !emailInput.value) {
            const randomNumbers = generateRandomNumber(randomDigits);
            emailInput.value = user.email.replace('@example.com', `${randomNumbers}@${emailSuffix}`);
        }

        const phoneNumberInput = form.querySelector('input[name="phonenumber"]');
        if (phoneNumberInput && !phoneNumberInput.value) {
            phoneNumberInput.value = user.phone;
        }

        const addressInput = form.querySelector('input[name*="address"]');
        if (addressInput && !addressInput.value) {
            addressInput.value = user.location.street.name;
        }

        const address2Input = form.querySelector('input[name="address2"]');
        if (address2Input && !address2Input.value) {
            address2Input.value = user.location.street.number;
        }

        const cityInput = form.querySelector('input[name="city"]');
        if (cityInput && !cityInput.value) {
            cityInput.value = user.location.city;
        }

        const stateInput = form.querySelector('input[name="state"]');
        if (stateInput && !stateInput.value) {
            stateInput.value = user.location.state;
        }

        const postcodeInput = form.querySelector('input[name="postcode"]');
        if (postcodeInput && !postcodeInput.value) {
            postcodeInput.value = user.location.postcode;
        }

        const countryInput = form.querySelector('input[name="country"]');
        if (countryInput && !countryInput.value) {
            countryInput.value = user.location.country;
        }
    }
})();
