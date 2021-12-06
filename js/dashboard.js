const UID = {
  Authorization: 'XY3nh0KpxGW8evTiIkOGAWyLGKM2',
};
const orderTable = document.querySelector('.orderTableWrap');
const discardAllBtn = document.querySelector('.discardAllBtn');
let orderData = [];
let str = '';

function init() {
  getData();
}

//取得原始資料
function getData() {
  axios
    .get('https://livejs-api.hexschool.io/api/livejs/v1/admin/hua0430/orders', {
      headers: UID,
    })
    .then((res) => {
      orderData = res.data.orders;
      renderData();
      chartC3();
    });
}

// C3
function chartC3() {
  let chartData = [];
  let tempObj = {};
  orderData.forEach((item) => {
    item.products.forEach((product) => {
      if (!tempObj[product.title]) {
        tempObj[product.title] = product.quantity;
      } else {
        tempObj[product.title] += product.quantity;
      }
    });
  });
  Object.keys(tempObj).forEach((item) => {
    let tempArr = [];
    tempArr.push(item);
    tempArr.push(tempObj[item]);
    chartData.push(tempArr);
  });
  c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
      type: 'pie',
      columns: chartData,
    },
  });
}

function renderData() {
  str = '';
  orderData.forEach((item) => {
    let productsStr = '';
    item.products.forEach((products) => {
      productsStr += ` <p>${products.title} x ${products.quantity}</p>`;
    });
    let date = new Date(item.createdAt * 1000);
    str += `
    <table class="orderPage-table">
    <thead>
        <tr>
            <th width="10%">訂單編號</th>
            <th width="10%">聯絡人</th>
            <th width="15%">聯絡地址</th>
            <th width="22%">電子郵件</th>
            <th width="15%">訂單品項</th>
            <th width="10%">訂單日期</th>
            <th>訂單狀態</th>
            <th>操作</th>
        </tr>
    </thead>
    <tr>
        <td>${item.createdAt}</td>
        <td>
            <p>${item.user.name}</p>
            <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>
            ${productsStr}
        </td>
        <td>${date.getFullYear()}/${date.getMonth()}/${date.getDate()}</td>
        <td class="orderStatus">
            <a href="#" class='paidBtn' data-paidId=${item.id} data-paid=${
      item.paid
    }>${item.paid ? '已處理' : '未處理'}</a>
        </td>
        <td>
            <input type="button" class="delSingleOrder-Btn" 
            data-id=${item.id}
            value="刪除">
        </td>
    </tr>
</table>
    `;
  });
  orderTable.innerHTML = str;
}

// 刪除全部
discardAllBtn.addEventListener('click', (e) => {
  e.preventDefault();
  axios
    .delete(
      'https://livejs-api.hexschool.io/api/livejs/v1/admin/hua0430/orders',
      {
        headers: UID,
      }
    )
    .then((res) => {
      swal.fire('成功', '全部訂單刪除成功', 'success');
      getData();
    })
    .catch((res) => {
      swal.fire('錯誤', '請稍後再試', 'error');
    });
});

// Table監聽 (訂單狀態 刪除單一功能)
orderTable.addEventListener('click', (e) => {
  e.preventDefault();
  let btn = e.target.getAttribute('class');
  let paidId = e.target.getAttribute('data-paidId');
  let deleteId = e.target.getAttribute('data-id');
  let paid;
  if (btn == 'delSingleOrder-Btn') {
    axios
      .delete(
        `https://livejs-api.hexschool.io/api/livejs/v1/admin/hua0430/orders/${deleteId}`,
        {
          headers: UID,
        }
      )
      .then((res) => {
        swal.fire('成功', '訂單刪除成功', 'success');
        getData();
      })
      .catch((res) => {
        swal.fire('錯誤', '請稍後再試', 'error');
      });
  }
  if (btn == 'paidBtn') {
    paid = e.target.dataset.paid == 'true' ? false : true;
    axios
      .put(
        'https://livejs-api.hexschool.io/api/livejs/v1/admin/hua0430/orders',
        {
          data: {
            id: paidId,
            paid: paid,
          },
        },
        {
          headers: UID,
        }
      )
      .then((res) => {
        swal.fire('成功', '訂單修改成功', 'success');
        getData();
      })
      .catch((res) => {
        swal.fire('錯誤', '請稍後再試', 'error');
      });
  }
});

init();
