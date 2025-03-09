(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const CATEGORY = {
  label: "카테고리",
  name: "category",
  lists: /* @__PURE__ */ new Map([
    ["KOREAN", "한식"],
    ["CHINESE", "중식"],
    ["JAPANESE", "일식"],
    ["WESTERN", "양식"],
    ["ASIAN", "아시안"],
    ["ETC", "기타"]
  ])
};
const DISTANCE = {
  label: "거리(도보 이동 시간)",
  name: "distance",
  lists: /* @__PURE__ */ new Map([
    ["FIVE_MIN", "5분 내"],
    ["TEN_MIN", "10분 내"],
    ["FIFTEEN_MIN", "15분 내"],
    ["TWENTY_MIN", "20분 내"],
    ["THIRTY_MIN", "30분 내"]
  ])
};
const NAME = {
  label: "이름",
  name: "name",
  helpText: "",
  required: true,
  type: "text"
};
const LINK = {
  label: "참고 링크",
  name: "link",
  helpText: "매장 정보를 확인할 수 있는 링크를 입력해 주세요.",
  required: false,
  type: "url"
};
const DESCRIPTION = {
  label: "설명",
  name: "description",
  helpText: "메뉴 등 추가 정보를 입력해 주세요."
};
const CANCEL_BUTTON = {
  type: "button",
  className: "button--secondary",
  content: "취소하기"
};
const ADD_BUTTON = {
  type: "submit",
  className: "button--primary",
  content: "추가하기"
};
const IMAGE = /* @__PURE__ */ new Map([
  ["한식", "category-korean.png"],
  ["중식", "category-chinese.png"],
  ["일식", "category-japanese.png"],
  ["양식", "category-western.png"],
  ["아시안", "category-asian.png"],
  ["기타", "category-etc.png"]
]);
const RESTAURANTS = [
  {
    category: `${CATEGORY.lists.get("KOREAN")}`,
    name: "피양콩할마니",
    distance: 10,
    description: "평양 출신의 할머니가 수십 년간 운영해온 비지 전문점 피양콩 할마니. 두부를 빼지 않은 되비지를 맛볼 수 있는 곳으로, ‘피양’은 평안도 사투리로 ‘평양’을 의미한다. 딸과 함께 운영하는 이곳에선 맷돌로 직접 간 콩만을 사용하며, 일체의 조건강식을 선보인다. 콩비이곳의 대표메뉴지만, 할머니가 옛날만들어내는 비지전골 또한느낄 수 있는 특별한메뉴다. 반찬은 손님들이덜어 먹을 수 있게 준비돼 있다.",
    link: ""
  },
  {
    category: `${CATEGORY.lists.get("CHINESE")}`,
    name: "친친",
    distance: 5,
    description: "Since 2004 편리한 교통과 주차, 그리고 관록만큼 깊은 맛과 정성으로 정통 중식의 세계를 펼쳐갑니다",
    link: ""
  },
  {
    category: `${CATEGORY.lists.get("JAPANESE")}`,
    name: "잇쇼우",
    distance: 10,
    description: "잇쇼우는 정통 자가제면 사누끼 우동이 대표메뉴입니다. 기술은 정성을 이길 수 없다는 신념으로 모든 음식에 최선을 다하는 잇쇼우는 고객 한분 한분께 최선을 다하겠습니다",
    link: ""
  },
  {
    category: `${CATEGORY.lists.get("WESTERN")}`,
    name: "이태리키친",
    distance: 20,
    description: "늘 변화를 추구하는 이태리키친입니다.",
    link: ""
  },
  {
    category: `${CATEGORY.lists.get("ASIAN")}`,
    name: "호아빈 삼성점",
    distance: 15,
    description: "푸짐한 양에 국물이 일품인 쌀국수",
    link: ""
  },
  {
    category: `${CATEGORY.lists.get("ETC")}`,
    name: "도스타코스 선릉점",
    distance: 5,
    description: "멕시칸 캐주얼 그릴",
    link: ""
  }
];
const stateStore = {
  state: {
    category: "",
    name: "",
    distance: 0,
    description: "",
    link: ""
  },
  updateState(newState) {
    this.state = newState;
  },
  initState() {
    const currentState = this.state;
    currentState.category = "";
    currentState.name = "";
    currentState.distance = 0;
    currentState.description = "";
    currentState.link = "";
  },
  getState() {
    return { ...this.state };
  }
};
function openModal() {
  const gnbButton = document.querySelector(".gnb__button");
  gnbButton.addEventListener("click", () => {
    const modal = document.querySelector(".modal");
    modal.classList.add("modal--open");
  });
}
function closeModal() {
  const closeButton = document.querySelector(".button--secondary");
  const modalBackdrop = document.querySelector(".modal-backdrop");
  closeButton.addEventListener("click", () => {
    const modal = document.querySelector(".modal");
    resetFormAndState();
    modal.classList.remove("modal--open");
  });
  modalBackdrop.addEventListener("click", () => {
    const modal = document.querySelector(".modal");
    resetFormAndState();
    modal.classList.remove("modal--open");
  });
  document.addEventListener("keydown", (event) => {
    const modal = document.querySelector(".modal");
    if (event.key === "Escape" && modal.classList.contains("modal--open")) {
      resetFormAndState();
      modal.classList.remove("modal--open");
    }
  });
}
function readNewRestaurant(addNewRestaurantItem2) {
  const modal = document.querySelector(".modal");
  const form = document.querySelector("#new-restaurant-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const newRestaurantData = {
      category: document.querySelector("#category").value,
      name: document.querySelector("#name").value,
      distance: document.querySelector("#distance").value.replace("분 내", ""),
      description: document.querySelector("#description").value,
      link: document.querySelector("#link").value
    };
    stateStore.updateState(newRestaurantData);
    addNewRestaurantItem2();
    resetFormAndState();
    modal.classList.remove("modal--open");
  });
}
function resetForm() {
  const form = document.querySelector("#new-restaurant-form");
  form.reset();
}
function resetState() {
  stateStore.initState();
}
function resetFormAndState() {
  resetForm();
  resetState();
}
const eventHandlers = {
  openModal,
  closeModal,
  readNewRestaurant
};
function createButton(fieldName) {
  const button = `<button type="${fieldName.type}" class="button ${fieldName.className} text-caption">${fieldName.content}</button>`;
  return button;
}
function createHeader({ title }) {
  const header = document.createElement("header");
  header.innerHTML = `<h1 class="gnb__title text-title">${title}</h1>
    <button type="button" class="gnb__button" aria-label="음식점 추가">
      <img src="./add-button.png" alt="음식점 추가" />
    </button>`;
  header.classList.add("gnb");
  return header;
}
function createInput(fieldName) {
  const input = `<div class="form-item ${fieldName.required ? "form-item--required" : ""}">
    <label for="${fieldName.name} text-caption">${fieldName.label}</label>
    <input type="${fieldName.type}" name="${fieldName.name}" id="${fieldName.name}">
    <span class="help-text text-caption">${fieldName.helpText}</span>
  </div>`;
  return input;
}
function createModal() {
  const modal = `<div class="modal">
      <div class="modal-backdrop"></div>
      <div class="modal-container">
        <h2 class="modal-title text-title">새로운 음식점</h2>
        <form id="new-restaurant-form"></form>
      </div>
    </div>`;
  return modal;
}
function createRestaurantItem({ category, name, distance, description, link }) {
  const item = `<li class="restaurant">
              <div class="restaurant__category">
                <img src="${IMAGE.get(category)}" alt="${category}" class="category-icon" />
              </div>
              <div class="restaurant__info">
                <h3 class="restaurant__name text-subtitle">${name}</h3>
                <span class="restaurant__distance text-body">캠퍼스부터 ${distance}분 내</span>
                <p class="restaurant__description text-body">
                  ${description}
                </p>
                <a href="${link}"></a>
              </div>
            </li>`;
  return item;
}
function createSelect(fieldName) {
  const select = `<div class="form-item form-item--required">
    <label for="${fieldName.name} text-caption">${fieldName.label}</label>
    <select name="${fieldName.name}" id="${fieldName.name}" required>
      <option value="">선택해 주세요</option>
      ${Array.from(fieldName.lists.values()).map((list) => {
    return `<option value="${list}">${list}</option>`;
  })}
    </select>
  </div>`;
  return select;
}
function createTextarea(fieldName) {
  const textarea = `<div class="form-item">
      <label for="${fieldName.name} text-caption">${fieldName.label}</label>
      <textarea name="${fieldName.name}" id="${fieldName.name}" cols="30" rows="5"></textarea>
      <span class="help-text text-caption">${fieldName.helpText}</span>
    </div>`;
  return textarea;
}
addEventListener("load", () => {
  appendHeader();
  initRestaurantItems();
  appendModal();
  appendModalContents();
  const nameInputElement = document.querySelector("#name");
  setRequired(nameInputElement);
  addEventHandlers();
});
function appendHeader() {
  const app = document.querySelector("#app");
  const header = createHeader({ title: "점심 뭐 먹지" });
  app.prepend(header);
}
function addNewRestaurantItem() {
  const ul = document.querySelector(".restaurant-list");
  const newRestaurantData = stateStore.getState();
  const newItem = createRestaurantItem(newRestaurantData);
  ul.insertAdjacentHTML("beforeend", newItem);
}
function addEventHandlers() {
  eventHandlers.openModal();
  eventHandlers.readNewRestaurant(addNewRestaurantItem);
  eventHandlers.closeModal();
}
function setRequired(element) {
  element.required = true;
}
function appendModal() {
  const main = document.querySelector("main");
  const modal = createModal();
  main.insertAdjacentHTML("beforeend", modal);
}
function appendModalContents() {
  const form = document.querySelector("#new-restaurant-form");
  const categorySelect = createSelect(CATEGORY);
  const nameInput = createInput(NAME);
  const distanceSelect = createSelect(DISTANCE);
  const descriptionTextarea = createTextarea(DESCRIPTION);
  const linkInput = createInput(LINK);
  form.insertAdjacentHTML("beforeend", categorySelect);
  form.insertAdjacentHTML("beforeend", nameInput);
  form.insertAdjacentHTML("beforeend", distanceSelect);
  form.insertAdjacentHTML("beforeend", descriptionTextarea);
  form.insertAdjacentHTML("beforeend", linkInput);
  appendModalButton(form);
}
function appendModalButton(form) {
  const buttonDiv = document.createElement("div");
  buttonDiv.classList.add("button-container");
  form.appendChild(buttonDiv);
  const addButton = createButton(ADD_BUTTON);
  const cancelButton = createButton(CANCEL_BUTTON);
  const buttonContainer = document.querySelector(".button-container");
  buttonContainer.insertAdjacentHTML("beforeend", cancelButton);
  buttonContainer.insertAdjacentHTML("beforeend", addButton);
}
function initRestaurantItems() {
  const ul = document.querySelector(".restaurant-list");
  const items = RESTAURANTS.map((restaurant) => {
    return createRestaurantItem(restaurant);
  }).join("");
  ul.insertAdjacentHTML("beforeend", items);
}
