function handleMainTabs() {
  const tabsElement = document.querySelector('#main-tabs');

  const tabs = Array.from(tabsElement.children[0].children);

  tabs.forEach((tab) => {
    const tabContents = document.querySelectorAll(
      `.${tabsElement.id}-tab-content`
    );
    // determine tab id
    let tabContent = tab.innerHTML;
    tabContent = tabContent.toLowerCase();
    const tabId = `tab-content-${tabContent}`;
    const tabContentCurrent = document.querySelector(`#${tabId}`);

    tab.addEventListener('click', () => {
      // remove active class from all elements
      tabContents.forEach((tabContent) => {
        tabContent.classList.remove('active');
      });
      tabs.forEach((tabInner) => {
        tabInner.classList.remove('active');
      });

      // append active class to active elements
      tabContentCurrent.classList.add('active');
      tab.classList.add('active');
    });
  });
}

// handle detailed category content
function handleDetailedCategoryTabs() {
  const tabs = Array.from(
    document.querySelector('#chart-tabs').children[0].children
  );
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const period = tab.innerHTML.toLowerCase();
      handleDetailedTable(period);
      chartLogic();

      tabs.forEach((tabInner) => {
        tabInner.classList.remove('active');
      });

      // append active class to active element
      tab.classList.add('active');
    });
  });
}

handleMainTabs();
handleDetailedCategoryTabs();
