//Đối tượng `Validator`
function Validator(options) {
  const selectorRules = {};
  function validate(inputElement, rule) {
    let errorMessage;
    const parentInputElement = inputElement.closest(options.formGroupSelector);
    const errorElement = parentInputElement.querySelector(
      options.errorSelector
    );

    // Lấy ra các rules của selector
    const rules = selectorRules[rule.selector];

    // Lặp qua từng rule & Kiểm tra
    // Nếu có lỗi thì dừng việc kiểm tra
    for (let i = 0; i < rules.length; i++) {
      switch (inputElement.type) {
        case "radio":
        case "checkbox":
          errorMessage = rules[i](
            formElement.querySelector(rule.selector + ":checked")
          );
          break;
        default:
          errorMessage = rules[i](inputElement.value);
      }
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      parentInputElement.classList.add("invalid");
    } else {
      errorElement.innerText = "";
      parentInputElement.classList.remove("invalid");
    }

    return !errorMessage;
  }

  // Lấy element của form cần validate
  const formElement = document.querySelector(options.form);
  if (formElement) {
    // Khi submit form
    formElement.onsubmit = function (e) {
      let isFormValid = true;

      // Lặp qua từng rule và validate
      options.rules.forEach((rule) => {
        const inputElement = formElement.querySelector(rule.selector);
        const isValid = validate(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        // Trường hợp submit với javascript
        if (typeof options.onSubmit === "function") {
          const enableInputs = formElement.querySelectorAll("[name]");
          const formInputValues = Array.from(enableInputs).reduce(
            (values, input) => {
              switch (input.type) {
                case "radio":
                  if (input.matches(":checked")) {
                    values[input.name] = input.value;
                  }
                  break;
                case "checkbox":
                  if (input.matches(":checked")) {
                    if (!Array.isArray(values[input.name])) {
                      values[input.name] = [];
                    }
                    values[input.name].push(input.value);
                  }
                  break;
                case "file":
                  values[input.name] = input.files;
                  break;
                default:
                  values[input.name] = input.value;
              }
              return values;
            },
            {}
          );
          options.onSubmit(formInputValues);
        }
        // Trường hợp submit với hành vi mặc định
        else {
          formElement.submit();
        }
      }

      e.preventDefault();
    };

    // Xử lý lặp qua mỗi rule và xử lý (Lắng nghe sự kiện blur, input,....)
    options.rules.forEach((rule) => {
      const inputElements = formElement.querySelectorAll(rule.selector);
      Array.from(inputElements).forEach((inputElement) => {
        // Xử lý trường hợp blur khỏi input
        inputElement.onblur = function () {
          validate(inputElement, rule);
        };

        // Xử lý khi người dùng nhập vào input
        inputElement.oninput = function () {
          const parentInputElement = inputElement.closest(
            options.formGroupSelector
          );
          const errorElement = parentInputElement.querySelector(
            options.errorSelector
          );
          errorElement.innerText = "";
          parentInputElement.classList.remove("invalid");
        };

        inputElement.onchange = function () {
          validate(inputElement, rule);
        };
      });

      // Lưu lại các rule cho mỗi input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }
    });
  }
}

//Định nghĩa rules
/*
* Nguyên tắc của các rules
1. Khi có lỗi => trả ra message lỗi
2. Khi hợp lệ = > trả ra undefined   
Array.from(enableInputs) --> Chuyển từ mảng đặc biệt sang mảng bình thường để dùng phương thức
element.parentElement.matches(selector) --> Kiểm tra phần tử này có match với phần tử kia hay không
- indexOf() trả về index ko có thì trả về -1, include()  trả về boolean (kiểm tra phần tử trong chuỗi hay mảng có tồn tại hay không)
- closest() Kiểm tra cha từ node element và trả về phần tử cha đó
- classList.contains() kiểm tra node element có tồn tại class chỉ định không và trả về boolean
*/
Validator.isRequired = function (selector, message) {
  return {
    selector,
    test(value) {
      return value ? undefined : message || "Vui lòng nhập trường này";
    },
  };
};

Validator.isEmail = function (selector) {
  return {
    selector,
    test(value) {
      const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : "Trường này phải nhập email";
    },
  };
};

Validator.minLength = function (selector, min, message) {
  return {
    selector,
    test(value) {
      return value.length >= min
        ? undefined
        : message || `Trường này tối thiểu ${min} ký tự`;
    },
  };
};

Validator.isConfirmed = function (selector, getConfirmValue, message) {
  return {
    selector,
    test(value) {
      return value === getConfirmValue()
        ? undefined
        : message || "Giá trị nhập vào không chính xác";
    },
  };
};
