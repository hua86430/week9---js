const API_PATH = 'hua0430';
const productWrap = document.querySelector('.productWrap');
const cartTable = document.querySelector('.shoppingCart-table');
const discardAllBtn = document.querySelector('.discardAllBtn');
const select = document.querySelector('.productSelect');
let productsData = [];
let newData = [];
let cartsData = [];
let finalTotal = 0;
let str = '';

function init() {
  renderData();
  renderCarts();
}

// 取得原始資料
function renderData() {
  axios
    .get(
      'https://livejs-api.hexschool.io/api/livejs/v1/customer/hua0430/products'
    )
    .then((res) => {
      productsData = res.data.products;
      getData(productsData);
    })
    .catch((error) => {
      console.log(error);
    });
}

// 渲染原始資料
function getData(data) {
  str = '';
  data.forEach((item, index) => {
    str += ` <li class="productCard">
    <h4 class="productType">新品</h4>
    <img src=${item.images} alt="product ${index}">
    <a href="#" class="addCardBtn" data-id='${item.id}'>加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$ ${item.origin_price}</del>
    <p class="nowPrice">NT$ ${item.price}</p>
</li>`;
  });
  productWrap.innerHTML = str;
}

// 取得購物車原始資料
function renderCarts() {
  axios
    .get('https://livejs-api.hexschool.io/api/livejs/v1/customer/hua0430/carts')
    .then((res) => {
      cartsData = res.data.carts;
      finalTotal = res.data.finalTotal;

      getCarts();
    });
}

function getCarts() {
  str = '';
  cartsData.forEach((item) => {
    str += `  <tr>
    <td>
        <div class="cardItem-title">
            <img src=${item.product.images} alt="">
            <p>${item.product.title}</p>
        </div>
    </td>
    <td>NT$${item.product.price.toLocaleString()}</td>
    <td style="text-align: center;">
    ${
      item.quantity === 1
        ? `<input type="button" class='numDown' data-itemId=${item.id} data-quantity=${item.quantity} disabled="value" style="background-color:transparent;border-radius: 50%;font-size:25px; border:0; outline:none;" value="-" >`
        : `<input type="button" class='numDown' data-itemId=${item.id} data-quantity=${item.quantity} style="background-color:transparent;border-radius: 50%;font-size:25px; border:0; outline:none;font-weight:bold;" value="-" >`
    }
    &ensp;${item.quantity}&ensp;
    <input type="button" class='numUp' data-itemId=${item.id} data-quantity=${
      item.quantity
    } style="background-color:transparent; border-radius:50%; border:0;font-size:20px; outline:none; font-weight:bold;" value="+" >
   
    </td>
    <td>NT$${(item.product.price * item.quantity).toLocaleString()}</td>
    <td class="discardBtn">
        <a href="#" class="material-icons" id="delBtn" data-deleteID=${item.id}>
            clear
        </a>
    </td>
</tr>`;
  });

  let isEmpty;
  if (cartsData.length == 0) {
    isEmpty = 'none';
  } else {
    isEmpty = '';
  }
  cartTable.innerHTML = `  <tr>
      <th style="text-align: center;" width="40%">品項</th>
      <th style="text-align: center;" width="15%">單價</th>
      <th style="text-align: center;" width="15%">數量</th>
      <th style="text-align: center;" width="15%">金額</th>
      <th width="15%"></th>
  </tr>
  ${str}
  <tr>
      <td>
          <a href="#" class="discardAllBtn" style="display:${isEmpty}">刪除所有品項</a>
      </td>
      <td></td>
      <td></td>
      <td>
          <p>總金額</p>
      </td>
      <td>NT$${finalTotal.toLocaleString()}</td>
  </tr>`;
}

//篩選
select.addEventListener('click', (e) => {
  let selected = e.target.value;
  if (selected === '全部') {
    getData(productsData);
  } else {
    newData = productsData.filter((item) => {
      return item.category == selected;
    });
    getData(newData);
  }
});

//加入購物車
productWrap.addEventListener('click', (e) => {
  e.preventDefault();

  let itemId = e.target.getAttribute('data-id');
  let btn = e.target.getAttribute('class');
  let itemQty = 1;

  cartsData.forEach((item) => {
    if (itemId == item.product.id) {
      itemQty = item.quantity + 1;
    }
  });

  if (btn === 'addCardBtn') {
    axios
      .post(
        'https://livejs-api.hexschool.io/api/livejs/v1/customer/hua0430/carts',
        {
          data: {
            productId: itemId,
            quantity: itemQty,
          },
        }
      )
      .then((res) => {
        if (res.data.status) {
          swal.fire('成功', '加入購物車成功', 'success');
        }
        renderCarts();
      })
      .catch((res) => {
        swal.fire('錯誤', '加入失敗,請稍後再試', 'error');
      });
  }
});

// 刪除單一購物車品項
cartTable.addEventListener('click', (e) => {
  e.preventDefault();
  let delId = e.target.getAttribute('data-deleteID');
  let btnClass = e.target.getAttribute('class');
  let btnId = e.target.getAttribute('id');
  if (btnId === 'delBtn') {
    axios
      .delete(
        `https://livejs-api.hexschool.io/api/livejs/v1/customer/hua0430/carts/${delId}`
      )
      .then((res) => {
        if (res.data.status) {
          swal.fire('成功', '刪除商品成功', 'success');
        }
        renderCarts();
      })
      .catch((res) => {
        swal.fire('錯誤', '刪除失敗,請稍後再試', 'error');
      });
  }
  if (btnClass === 'discardAllBtn') {
    axios
      .delete(
        'https://livejs-api.hexschool.io/api/livejs/v1/customer/hua0430/carts'
      )
      .then((res) => {
        if (res.data.status) {
          swal.fire('成功', `${res.data.message}`, 'success');
        }
        discardAllBtn.setAttribute('disabled', 'disabled');
        renderCarts();
      })
      .catch((res) => {
        swal.fire('錯誤', '購物車為空', 'error');
      });
  }

  //修改購物車數量
  let itemNum = e.target.getAttribute('data-quantity');
  let patchId = e.target.getAttribute('data-itemId');
  if (btnClass === 'numUp') {
    itemNum++;
  } else if (btnClass === 'numDown') {
    itemNum--;
  }

  axios
    .patch(
      'https://livejs-api.hexschool.io/api/livejs/v1/customer/hua0430/carts',
      {
        data: {
          id: patchId,
          quantity: itemNum,
        },
      }
    )
    .then((res) => {
      if (res.data.status) {
        swal.fire('成功', '數量修改成功', 'success');
        renderCarts();
      }
    })
    .catch((res) => {
      swal.fire('錯誤', '請稍後再試', 'error');
    });
});

//表單驗證

const constrainsts = {
  姓名: {
    presence: {
      message: '是必填欄位',
    },
    format: {
      pattern: '^[\u4e00-\u9fa5]+$|^[a-zA-Z]+$',
      message: '內含數字或特殊字元,請重新輸入',
    },
  },
  電話: {
    presence: {
      message: '是必填欄位',
    },
    format: {
      pattern: /^09\d{2}-?\d{3}-?\d{3}$/,
      message: '格式錯誤',
    },
  },
  Email: {
    presence: {
      message: '是必填欄位',
    },
    email: {
      message: '格式錯誤',
    },
  },
  寄送地址: {
    presence: {
      message: '是必填欄位',
    },
  },
};
const orderForm = document.querySelector('.orderInfo-form');
const inputs = document.querySelectorAll(
  'input[type=text],input[type=tel],input[type=email]'
);
let isError = false; // 要改回true
inputs.forEach((item) => {
  item.nextElementSibling.textContent = '';
  item.addEventListener('change', (e) => {
    item.nextElementSibling.textContent = '';
    let errors = validate(orderForm, constrainsts);
    if (errors) {
      Object.keys(errors).forEach((keys) => {
        document.querySelector(
          `input[name=${keys}]`
        ).nextElementSibling.textContent = errors[keys];
      });
      isError = true;
    } else {
      isError = false;
    }
    console.log(isError);
  });
});

// 表單送出

const tradeWay = document.querySelector('#tradeWay');
const orderBtn = document.querySelector('.orderInfo-btn');

// 預設交易方式 = ATM
let originTrade = 'ATM';
// 取得交易方式
tradeWay.addEventListener('click', (e) => {
  originTrade = e.target.value;
});

orderBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (isError) {
    swal.fire('錯誤', '資料尚未填寫完畢', 'error');
  } else {
    //取得input value
    let orderData = [];
    inputs.forEach((item) => {
      orderData.push(item.value);
    });

    axios
      .post(
        'https://livejs-api.hexschool.io/api/livejs/v1/customer/hua0430/orders',
        {
          data: {
            user: {
              name: orderData[0],
              tel: orderData[1],
              email: orderData[2],
              address: orderData[3],
              payment: originTrade,
            },
          },
        }
      )
      .then((res) => {
        console.log(res.data);
        swal.fire('成功', '訂單已送出', 'success');
        renderCarts();
        orderForm.reset();
      })
      .catch((res) => {
        swal.fire('錯誤', '購物車為空', 'error');
      });
  }
});
init();
