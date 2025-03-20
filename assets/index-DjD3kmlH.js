var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var _key;
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
const selectElement = (selector, ancestor = document) => {
  const element = ancestor.querySelector(selector);
  if (!element) {
    throw new Error(`${selector}가 존재하지 않습니다.`);
  }
  return element;
};
const selectElements = (selector, ancestor = document) => {
  const element = ancestor.querySelectorAll(selector);
  if (!element) {
    throw new Error(`${selector}가 존재하지 않습니다.`);
  }
  return element;
};
const renderElement = (selector, component, position = "beforeend") => {
  const targetElement = selectElement(selector);
  if (component instanceof HTMLElement) {
    targetElement.insertAdjacentElement(position, component);
  } else {
    targetElement.insertAdjacentHTML(position, component);
  }
};
function openAddRestaurantModal() {
  const gnbButton = selectElement(".gnb__button");
  gnbButton.addEventListener("click", () => {
    const modal = selectElement(".add-restaurant-modal");
    modal.classList.add("modal--open");
  });
}
function openRestaurantInfoModal(renderer) {
  const handleRestaurantClick = (event) => {
    const target = event.target;
    if (!target.closest(".restaurant-list") || target.closest(".restaurant__favorite")) {
      return;
    }
    const targetModal = selectElement(".restaurant-info-modal");
    targetModal.classList.add("modal--open");
    const restaurantItem = target.closest(".restaurant");
    const id = Number(restaurantItem.dataset.id);
    renderer(id);
  };
  const restaurantList = selectElement(".restaurant-list");
  restaurantList.addEventListener("click", handleRestaurantClick);
}
function resetForm() {
  const form = selectElement("#new-restaurant-form");
  if (form instanceof HTMLFormElement) {
    form.reset();
  }
}
function closeModal() {
  const closeButtons = selectElements(".close-modal-button");
  const modalBackdrops = selectElements(".modal-backdrop");
  const handleCloseButtonClick = (event) => {
    const target = event.target;
    const targetModal = target.closest(".modal");
    resetForm();
    targetModal.classList.remove("modal--open");
  };
  const handleBackdropClick = (event) => {
    const target = event.target;
    const targetModal = target.closest(".modal");
    resetForm();
    targetModal.classList.remove("modal--open");
  };
  const handleEscapeKeydown = (event) => {
    const openedModals = [...selectElements(".modal--open")];
    if (event.key === "Escape" && openedModals.length > 0) {
      const targetModal = openedModals.pop();
      if (!(targetModal instanceof HTMLDivElement)) {
        return;
      }
      resetForm();
      targetModal.classList.remove("modal--open");
    }
  };
  closeButtons.forEach((closeButton) => {
    closeButton.addEventListener("click", handleCloseButtonClick);
  });
  modalBackdrops.forEach((modalBackdrop) => {
    modalBackdrop.addEventListener("click", handleBackdropClick);
  });
  document.addEventListener("keydown", handleEscapeKeydown);
}
function selectSortKey(stateHandler, renderer) {
  const sortSelector = selectElement("#sort-selector");
  sortSelector.addEventListener("change", (event) => {
    const target = event.target;
    const sortKey = target.value;
    stateHandler({ sort: sortKey });
    renderer();
  });
}
function selectCategory(stateHandler, renderer) {
  const categoryFilter = selectElement("#category-filter");
  categoryFilter.addEventListener("change", (event) => {
    const target = event.target;
    const filteringKey = target.value;
    stateHandler({ category: filteringKey });
    renderer();
  });
}
function deleteRestaurant(dataHandler, renderer) {
  const handleDeleteClick = (event) => {
    const target = event.target;
    const targetModal = target.closest(".modal-container");
    const restaurantItem = selectElement(".restaurant", targetModal);
    const id = Number(restaurantItem.dataset.id);
    dataHandler(id);
    renderer();
  };
  const deleteItemButton = selectElement(".delete-item-button");
  if (deleteItemButton instanceof HTMLButtonElement) {
    deleteItemButton.addEventListener("click", handleDeleteClick);
  }
}
function switchTab(stateHandler, renderer) {
  let selected = selectElement(".selected");
  const handleTabClick = (event) => {
    const target = event.target;
    const tab2 = target.classList.contains("tab");
    if (!tab2) {
      return;
    }
    if (selected) {
      selected.classList.remove("selected");
    }
    selected = target;
    selected.classList.add("selected");
    const isFavoriteTab = target.dataset.tab === "favorite";
    stateHandler({ isFavoriteTab });
    renderer(isFavoriteTab);
  };
  const tabContainer = selectElement(".tab-container");
  tabContainer.addEventListener("click", handleTabClick);
}
function readNewRestaurant(dataHandler, renderer) {
  const modal = selectElement(".modal");
  const form = selectElement("#new-restaurant-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const newRestaurantData = extractFormData();
    dataHandler(newRestaurantData);
    resetForm();
    modal.classList.remove("modal--open");
    renderer();
  });
}
function extractFormData() {
  const category = selectElement("#category");
  const name = selectElement("#name");
  const distance = selectElement("#distance");
  const description = selectElement("#description");
  const link = selectElement("#link");
  if (category instanceof HTMLSelectElement && name instanceof HTMLInputElement && distance instanceof HTMLSelectElement && description instanceof HTMLTextAreaElement && link instanceof HTMLInputElement) {
    return {
      category: category.value,
      name: name.value,
      distance: Number(distance.value.replace("분 내", "")),
      description: description.value,
      link: link.value
    };
  }
  throw new Error("form 요소의 값이 존재하지 않습니다.");
}
function toggleFavoriteButton(dataHandler, renderer) {
  const handleFavoriteClick = (event) => {
    const target = event.target;
    const restaurantItem = target.closest(".restaurant");
    if (!restaurantItem || !target.closest(".restaurant__favorite")) return;
    const id = Number(restaurantItem.dataset.id);
    const isFavorite = dataHandler(id);
    renderer(id, isFavorite);
  };
  selectElement(".restaurant-list").addEventListener("click", handleFavoriteClick);
  selectElement(".restaurant-info-modal").addEventListener("click", handleFavoriteClick);
}
const stateStore = {
  restaurantState: {
    sort: "name",
    category: "",
    isFavoriteTab: false
  },
  updateState(state) {
    const keys = Object.keys(state);
    keys.forEach((key) => {
      if (!(key in this.restaurantState)) {
        throw new Error("restaurantState에 존재하지 않는 key 입니다.");
      }
    });
    this.restaurantState = {
      ...this.restaurantState,
      ...state
    };
  },
  getState() {
    return { ...this.restaurantState };
  }
};
function parseJSON(data) {
  return JSON.parse(data);
}
function stringifyJSON(data) {
  return JSON.stringify(data);
}
const store = {
  storage: window.localStorage,
  getData(key) {
    return this.storage.getItem(key);
  },
  setData(key, data) {
    this.storage.setItem(key, data);
  },
  removeData(key) {
    this.storage.removeItem(key);
  },
  checkValidKey(key) {
    return this.storage.getItem(key) !== null;
  }
};
class DataService {
  constructor(key) {
    __privateAdd(this, _key);
    __privateSet(this, _key, key);
  }
  getDataList() {
    return parseJSON(store.getData(__privateGet(this, _key)) ?? "[]");
  }
  findDataById(id) {
    const totalData = this.getDataList();
    const target = totalData.find((data) => data.id === id);
    if (!target) {
      throw new Error("데이터가 없습니다. id를 확인해주세요.");
    }
    return target;
  }
  updateDataById(id, newData) {
    const totalData = this.getDataList();
    const maintainedDataList = totalData.filter((data) => {
      return data.id !== id;
    });
    const newDataList = [...maintainedDataList, newData];
    const stringData = stringifyJSON(newDataList);
    store.setData(__privateGet(this, _key), stringData);
  }
  addData(data) {
    const totalData = this.getDataList();
    const newDataList = [...totalData, data];
    const stringData = stringifyJSON(newDataList);
    store.setData(__privateGet(this, _key), stringData);
  }
  addDataList(dataList) {
    const totalData = this.getDataList();
    const newDataList = [...totalData, ...dataList];
    const stringData = stringifyJSON(newDataList);
    store.setData(__privateGet(this, _key), stringData);
  }
  deleteDataById(id) {
    const totalData = this.getDataList();
    const maintainedDataList = totalData.filter((data) => data.id !== id);
    const stringData = stringifyJSON(maintainedDataList);
    store.setData(__privateGet(this, _key), stringData);
  }
  getNewDataId() {
    const totalData = this.getDataList();
    return totalData.length;
  }
  checkHasKey() {
    return store.checkValidKey(__privateGet(this, _key));
  }
}
_key = new WeakMap();
const STORE = {
  restaurantsKey: "restaurants"
};
function sortRestaurants(sortKey, restaurants) {
  const sortedRestaurants = [...restaurants];
  switch (sortKey) {
    case "name":
      sortedRestaurants.sort((prev, next) => {
        const nameOrder = prev.name.localeCompare(next.name);
        if (nameOrder !== 0) {
          return nameOrder;
        }
        return prev.distance - next.distance;
      });
      break;
    case "distance":
      sortedRestaurants.sort((prev, next) => {
        if (prev.distance !== next.distance) {
          return prev.distance - next.distance;
        }
        return prev.name.localeCompare(next.name);
      });
      break;
    default:
      throw new Error("유효하지 않은 정렬 기준입니다.");
  }
  return sortedRestaurants;
}
function filterByFavorite(isFavoriteTab, restaurants) {
  if (isFavoriteTab) {
    return restaurants.filter(({ favorite }) => favorite);
  }
  return restaurants;
}
function filterByCategory(filteringKey, restaurants) {
  if (filteringKey) {
    return restaurants.filter((restaurant) => restaurant.category === filteringKey);
  }
  return restaurants;
}
const restaurantService = {
  restaurantManager: new DataService(STORE.restaurantsKey),
  getRestaurants() {
    return this.restaurantManager.getDataList();
  },
  getRestaurantById(id) {
    return this.restaurantManager.findDataById(id);
  },
  addRestaurant(restaurantData) {
    const id = this.restaurantManager.getNewDataId();
    const restaurant = { ...restaurantData, id, favorite: false };
    this.restaurantManager.addData(restaurant);
  },
  updateRestaurant(id, newProperty) {
    const existing = this.getRestaurantById(id);
    const updated = { ...existing, ...newProperty };
    this.restaurantManager.updateDataById(id, updated);
  },
  deleteRestaurant(id) {
    this.restaurantManager.deleteDataById(id);
  },
  getFilteredRestaurants(states, restaurants) {
    const { isFavoriteTab, category, sort } = states;
    const favoriteFiltered = filterByFavorite(isFavoriteTab, restaurants);
    const categoryFiltered = filterByCategory(category, favoriteFiltered);
    const filteredRestaurants = sortRestaurants(sort, categoryFiltered);
    return filteredRestaurants;
  },
  toggleFavorite(id) {
    const targetData = this.restaurantManager.findDataById(id);
    const updateData = { favorite: !targetData.favorite };
    this.updateRestaurant(id, updateData);
    return updateData.favorite;
  },
  checkHasRestaurantData() {
    return this.restaurantManager.checkHasKey();
  }
};
const RESTAURANTS = [
  {
    id: 0,
    category: "KOREAN",
    name: "피양콩할마니",
    distance: 10,
    description: "평양 출신의 할머니가 수십 년간 운영해온 비지 전문점 피양콩 할마니. 두부를 빼지 않은 되비지를 맛볼 수 있는 곳으로, ‘피양’은 평안도 사투리로 ‘평양’을 의미한다. 딸과 함께 운영하는 이곳에선 맷돌로 직접 간 콩만을 사용하며, 일체의 조건강식을 선보인다. 콩비이곳의 대표메뉴지만, 할머니가 옛날만들어내는 비지전골 또한느낄 수 있는 특별한메뉴다. 반찬은 손님들이덜어 먹을 수 있게 준비돼 있다.",
    link: "",
    favorite: false
  },
  {
    id: 1,
    category: "CHINESE",
    name: "친친",
    distance: 5,
    description: "Since 2004 편리한 교통과 주차, 그리고 관록만큼 깊은 맛과 정성으로 정통 중식의 세계를 펼쳐갑니다",
    link: "",
    favorite: false
  },
  {
    id: 2,
    category: "JAPANESE",
    name: "잇쇼우",
    distance: 10,
    description: "잇쇼우는 정통 자가제면 사누끼 우동이 대표메뉴입니다. 기술은 정성을 이길 수 없다는 신념으로 모든 음식에 최선을 다하는 잇쇼우는 고객 한분 한분께 최선을 다하겠습니다",
    link: "",
    favorite: false
  },
  {
    id: 3,
    category: "WESTERN",
    name: "이태리키친",
    distance: 20,
    description: "늘 변화를 추구하는 이태리키친입니다.",
    link: "",
    favorite: false
  },
  {
    id: 4,
    category: "ASIAN",
    name: "호아빈 삼성점",
    distance: 15,
    description: "푸짐한 양에 국물이 일품인 쌀국수",
    link: "",
    favorite: false
  },
  {
    id: 5,
    category: "ETC",
    name: "도스타코스 선릉점",
    distance: 5,
    description: "멕시칸 캐주얼 그릴",
    link: "",
    favorite: false
  }
];
const header = {
  render({ header: header2 }) {
    renderElement("#app", header2, "afterbegin");
  },
  setEvent(eventHandlers) {
    eventHandlers.forEach((eventHandler) => {
      eventHandler();
    });
  }
};
const tab = {
  render({ totalItemsTab, frequentItemsTab }) {
    const div = document.createElement("div");
    div.classList.add("tab-container");
    renderElement("main", div, "afterbegin");
    renderElement(".tab-container", totalItemsTab);
    renderElement(".tab-container", frequentItemsTab);
    const tabs = selectElements(".tab");
    ["all", "favorite"].forEach((value, index) => {
      tabs[index].dataset.tab = value;
    });
  },
  setEvent(eventHandlers) {
    eventHandlers.forEach((eventHandler) => {
      eventHandler();
    });
  }
};
const restaurantItems = {
  render({ restaurants }) {
    const restaurantsContent = restaurants();
    const ul = selectElement(".restaurant-list");
    if (ul.hasChildNodes()) {
      ul.replaceChildren();
    }
    renderElement(".restaurant-list", restaurantsContent);
  },
  setEvent(eventHandlers) {
    eventHandlers.forEach((eventHandler) => {
      eventHandler();
    });
  }
};
const itemsController = {
  render({ categoryFilter, sortSelector }) {
    const div = document.createElement("div");
    div.classList.add("items-controller");
    renderElement(".tab-container", div, "afterend");
    renderElement(".items-controller", categoryFilter);
    renderElement(".items-controller", sortSelector);
  },
  setEvent(eventHandlers) {
    eventHandlers.forEach((eventHandler) => {
      eventHandler();
    });
  }
};
const addRestaurantModal = {
  render({ modalContainer, modalContents, modalButton }) {
    this.renderContainer(modalContainer);
    this.renderContents(modalContents);
    this.renderButton(modalButton);
  },
  renderContainer(container) {
    renderElement("main", container);
    const h2 = document.createElement("h2");
    h2.classList.add("modal-title", "text-title");
    h2.textContent = "새로운 음식점";
    const form = document.createElement("form");
    form.id = "new-restaurant-form";
    const selector = ".add-restaurant-modal > .modal-container";
    renderElement(selector, h2);
    renderElement(selector, form);
  },
  renderContents({ categorySelect, nameInput, distanceSelect, descriptionTextarea, linkInput }) {
    const selector = "#new-restaurant-form";
    renderElement(selector, categorySelect);
    renderElement(selector, nameInput);
    renderElement(selector, distanceSelect);
    renderElement(selector, descriptionTextarea);
    renderElement(selector, linkInput);
  },
  renderButton({ addButton, cancelButton }) {
    const selector = "#new-restaurant-form";
    const buttonDiv = document.createElement("div");
    buttonDiv.classList.add("button-container");
    renderElement(selector, buttonDiv);
    renderElement(".button-container", cancelButton);
    renderElement(".button-container", addButton);
  },
  setEvent(eventHandlers) {
    eventHandlers.forEach((eventHandler) => {
      eventHandler();
    });
  }
};
const restaurantInfoModal = {
  render({ modalContainer, modalButton }) {
    this.renderContainer(modalContainer);
    this.renderButton(modalButton);
  },
  renderContainer(container) {
    renderElement("main", container);
  },
  renderContents({ id, restaurantsInfo }) {
    const contents = restaurantsInfo(id);
    const targetModal = document.querySelector(".restaurant-info-modal > .modal-container");
    const prevInformation = targetModal.querySelector(".restaurant");
    if (prevInformation) {
      targetModal.removeChild(prevInformation);
    }
    renderElement(".restaurant-info-modal > .modal-container", contents, "afterbegin");
  },
  renderButton({ deleteButton, closeButton }) {
    const buttonDiv = document.createElement("div");
    buttonDiv.classList.add("button-container");
    buttonDiv.insertAdjacentHTML("beforeend", deleteButton);
    buttonDiv.insertAdjacentHTML("beforeend", closeButton);
    renderElement(".restaurant-info-modal > .modal-container", buttonDiv);
  },
  setEvent(eventHandlers) {
    eventHandlers.forEach((eventHandler) => {
      eventHandler();
    });
  }
};
function createButton(fieldName) {
  const button = `<button type="${fieldName.type}" class="button ${fieldName.classNames.join(" ")} text-caption">${fieldName.content}</button>`;
  return button;
}
function createHeader({ title }) {
  const header2 = document.createElement("header");
  header2.innerHTML = `<h1 class="gnb__title text-title">${title}</h1>
    <button type="button" class="gnb__button" aria-label="음식점 추가">
      <img src="./add-button.png" alt="음식점 추가" />
    </button>`;
  header2.classList.add("gnb");
  return header2;
}
function createInput(fieldName) {
  const input = `<div class="form-item ${fieldName.required ? "form-item--required" : ""}">
    <label for="${fieldName.name} text-caption">${fieldName.label}</label>
    <input type="${fieldName.type}" name="${fieldName.name}" id="${fieldName.name}">
    <span class="help-text text-caption">${fieldName.helpText}</span>
  </div>`;
  return input;
}
function createModal({ classNames }) {
  const modal = `<div class="modal ${classNames.join(" ")}">
      <div class="modal-backdrop"></div>
      <div class="modal-container">
      </div>
    </div>`;
  return modal;
}
const ADD_RESTAURANT_MODAL = {
  classNames: ["add-restaurant-modal"]
};
const DELETE_INFO_BUTTON = {
  type: "button",
  classNames: ["button--secondary", "close-modal-button", "delete-item-button"],
  content: "삭제하기"
};
const CLOSE_INFO_BUTTON = {
  type: "submit",
  classNames: ["button--primary", "close-modal-button"],
  content: "닫기"
};
const RESTAURANT_INFO_MODAL = {
  classNames: ["restaurant-info-modal"]
};
const CATEGORY = {
  label: "카테고리",
  name: "category",
  required: true,
  lists: /* @__PURE__ */ new Map([
    ["", "선택해주세요"],
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
  required: true,
  lists: /* @__PURE__ */ new Map([
    [null, "선택해주세요"],
    [5, "5분 내"],
    [10, "10분 내"],
    [15, "15분 내"],
    [20, "20분 내"],
    [30, "30분 내"]
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
  classNames: ["button--secondary", "close-modal-button"],
  content: "취소하기"
};
const ADD_BUTTON = {
  type: "submit",
  classNames: ["button--primary", "add-item-button"],
  content: "추가하기"
};
const IMAGE = /* @__PURE__ */ new Map([
  ["KOREAN", "category-korean.png"],
  ["CHINESE", "category-chinese.png"],
  ["JAPANESE", "category-japanese.png"],
  ["WESTERN", "category-western.png"],
  ["ASIAN", "category-asian.png"],
  ["ETC", "category-etc.png"]
]);
const TOTAL_ITEMS_TAB = {
  type: "button",
  classNames: ["tab", "selected"],
  content: "모든 음식점"
};
const FREQUENT_ITEMS_TAB = {
  type: "button",
  classNames: ["tab"],
  content: "자주 가는 음식점"
};
const CATEGORY_FILTER = {
  label: "",
  name: "category-filter",
  required: false,
  lists: /* @__PURE__ */ new Map([
    ["", "전체"],
    ["KOREAN", "한식"],
    ["CHINESE", "중식"],
    ["JAPANESE", "일식"],
    ["WESTERN", "양식"],
    ["ASIAN", "아시안"],
    ["ETC", "기타"]
  ])
};
const SORT_SELECTOR = {
  label: "",
  name: "sort-selector",
  required: false,
  lists: /* @__PURE__ */ new Map([
    ["name", "이름순"],
    ["distance", "거리순"]
  ])
};
function createRestaurantItem({ id, category, name, distance, description, favorite }) {
  const item = `<li class="restaurant" data-id="${id}">
              <div class="restaurant__category">
                <img src="${IMAGE.get(category)}" alt="${category}" class="category-icon" />
              </div>
              <button type="button" class="button restaurant__favorite">
                <img src="${favorite ? "favorite-icon-filled.png" : "favorite-icon-lined.png"}" alt="favorite-icon" />
              </button>
              <div class="restaurant__info">
                <div class="restaurant__details">
                  <h3 class="restaurant__name text-subtitle">${name}</h3>
                  <span class="restaurant__distance text-body">캠퍼스부터 ${distance}분 내</span>
                </div>
                <p class="restaurant__description text-body">${description}</p>
              </div>
            </li>
          `;
  return item;
}
function createSelect(fieldName) {
  const select = `<div class="form-item ${fieldName.required ? "form-item--required" : ""}">
    <label for="${fieldName.name} text-caption">${fieldName.label}</label>
    <select name="${fieldName.name}" id="${fieldName.name}">
      ${Array.from(fieldName.lists).map(([key, name]) => {
    return `<option value="${key}">${name}</option>`;
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
function createRestaurantInfo({ id, category, name, distance, description, link, favorite }) {
  const information = `<div class="restaurant restaurant__body" data-id="${id}">
                <div class="restaurant__category">
                  <img src="${IMAGE.get(category)}" alt="${category}" class="category-icon" />
                </div>
                <button type="button" class="button restaurant__favorite">
                  <img src="${favorite ? "favorite-icon-filled.png" : "favorite-icon-lined.png"}" alt="favorite-icon" />
                </button>
              <div class="restaurant__info__details">
                <h3 class="restaurant__name text-subtitle">${name}</h3>
                <span class="restaurant__distance text-body">캠퍼스부터 ${distance}분 내</span>
                <p class="restaurant__description__details text-body">${description}</p>
                <a href="${link}" class="restaurant__link text-body">${link}</a>
              </div>
            </div>
            `;
  return information;
}
addEventListener("load", () => {
  handleAddRestaurantModal();
  handleRestaurantInfoModal();
  closeModal();
  handleHeader();
  handleTab();
  handleItemsController();
  handleRestaurantItems();
});
const handleAddRestaurantModal = () => {
  addRestaurantModal.render({
    modalContainer: createModal(ADD_RESTAURANT_MODAL),
    modalContents: {
      categorySelect: createSelect(CATEGORY),
      nameInput: createInput(NAME),
      distanceSelect: createSelect(DISTANCE),
      descriptionTextarea: createTextarea(DESCRIPTION),
      linkInput: createInput(LINK)
    },
    modalButton: {
      addButton: createButton(ADD_BUTTON),
      cancelButton: createButton(CANCEL_BUTTON)
    }
  });
  addRestaurantModal.setEvent([
    initFormValidation,
    () => readNewRestaurant(
      restaurantService.addRestaurant.bind(restaurantService),
      () => restaurantItems.render({
        restaurants: () => filterAndSortRestaurants()
      })
    )
  ]);
};
const handleRestaurantInfoModal = () => {
  restaurantInfoModal.render({
    modalContainer: createModal(RESTAURANT_INFO_MODAL),
    modalButton: {
      deleteButton: createButton(DELETE_INFO_BUTTON),
      closeButton: createButton(CLOSE_INFO_BUTTON)
    }
  });
  restaurantInfoModal.setEvent([
    () => {
      const modalContents = (id) => {
        const targetData = restaurantService.getRestaurantById(id);
        return createRestaurantInfo(targetData);
      };
      const renderer = (id) => restaurantInfoModal.renderContents({ id, restaurantsInfo: modalContents });
      openRestaurantInfoModal(renderer);
    },
    () => deleteRestaurant(
      restaurantService.deleteRestaurant.bind(restaurantService),
      () => restaurantItems.render({
        restaurants: () => filterAndSortRestaurants()
      })
    )
  ]);
};
const handleHeader = () => {
  header.render({ header: createHeader({ title: "점심 뭐 먹지" }) });
  header.setEvent([openAddRestaurantModal]);
};
const handleTab = () => {
  tab.render({
    totalItemsTab: createButton(TOTAL_ITEMS_TAB),
    frequentItemsTab: createButton(FREQUENT_ITEMS_TAB)
  });
  tab.setEvent([
    () => switchTab(
      stateStore.updateState.bind(stateStore),
      () => restaurantItems.render({
        restaurants: () => filterAndSortRestaurants()
      })
    )
  ]);
};
const handleItemsController = () => {
  itemsController.render({
    categoryFilter: createSelect(CATEGORY_FILTER),
    sortSelector: createSelect(SORT_SELECTOR)
  });
  itemsController.setEvent([
    () => selectSortKey(
      stateStore.updateState.bind(stateStore),
      () => restaurantItems.render({
        restaurants: () => filterAndSortRestaurants()
      })
    ),
    () => selectCategory(
      stateStore.updateState.bind(stateStore),
      () => restaurantItems.render({
        restaurants: () => filterAndSortRestaurants()
      })
    )
  ]);
};
const handleRestaurantItems = () => {
  initRestaurantItems();
  restaurantItems.render({
    restaurants: () => {
      const restaurantsData = restaurantService.getRestaurants();
      return restaurantsData.map((restaurant) => createRestaurantItem(restaurant)).join("");
    }
  });
  restaurantItems.setEvent([
    () => toggleFavoriteButton(restaurantService.toggleFavorite.bind(restaurantService), updateFavoriteIcon)
  ]);
};
const initRestaurantItems = () => {
  const hasKey = restaurantService.checkHasRestaurantData();
  if (!hasKey) {
    [...RESTAURANTS].forEach((restaurant) => {
      restaurantService.addRestaurant(restaurant);
    });
  }
};
const filterAndSortRestaurants = () => {
  const states = stateStore.getState();
  const restaurantsData = restaurantService.getRestaurants();
  const filteredData = restaurantService.getFilteredRestaurants(states, restaurantsData);
  return filteredData.map((restaurant) => createRestaurantItem(restaurant)).join("");
};
const updateFavoriteIcon = (id, favorite) => {
  const targetItems = document.querySelectorAll(`[data-id="${id}"]`);
  targetItems.forEach((target) => {
    const imageElement = target.querySelector(".restaurant__favorite > img");
    imageElement.src = favorite ? "favorite-icon-filled.png" : "favorite-icon-lined.png";
  });
  const { isFavoriteTab } = stateStore.getState();
  if (isFavoriteTab) {
    restaurantItems.render({
      restaurants: () => filterAndSortRestaurants()
    });
  }
};
const initFormValidation = () => {
  const nameInputElement = selectElement("#name");
  const categorySelectElement = selectElement("#category");
  const distanceSelectElement = selectElement("#distance");
  setRequired(nameInputElement);
  setRequired(categorySelectElement);
  setRequired(distanceSelectElement);
};
const setRequired = (element) => {
  element.required = true;
};
