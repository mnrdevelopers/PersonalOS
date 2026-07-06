/* ══════════════════════════════════════════════════════════════
   SEARCHABLE CATEGORY PICKER — Global helpers
   Works with the custom #cat-search-picker in addTransactionModal
   All categories are sorted alphabetically (handled in dashboard.js loadTransactionCategories)
══════════════════════════════════════════════════════════════ */

window.renderCatSearchList = function(categories) {
    const list = document.getElementById('cat-search-list');
    if (!list) return;

    list.innerHTML = '';

    if (!categories || categories.length === 0) {
        list.innerHTML = '<div class="cat-search-empty">No categories found</div>';
        return;
    }

    // Group by _group label (Income / Expense)
    let lastGroup = null;
    categories.forEach(function(cat) {
        if (cat._group !== lastGroup) {
            lastGroup = cat._group;
            const groupHeader = document.createElement('div');
            groupHeader.className = 'cat-search-group-label';
            const isIncome = cat._group === 'Income';
            groupHeader.innerHTML =
                '<i class="fas fa-' + (isIncome ? 'arrow-down text-success' : 'arrow-up text-danger') + ' me-1"></i>' +
                cat._group;
            list.appendChild(groupHeader);
        }

        const item = document.createElement('div');
        item.className = 'cat-search-item';
        item.dataset.value = cat.name;
        const icon = cat.icon || (window.getCategoryIcon ? window.getCategoryIcon(cat.name) : '\uD83C\uDFF7\uFE0F');
        item.innerHTML =
            '<span class="cat-search-item-icon">' + icon + '</span>' +
            '<span class="cat-search-item-name">' + cat.name + '</span>';
        if (cat.color) item.style.setProperty('--cat-item-color', cat.color);
        item.addEventListener('click', function() { window.selectCatSearchOption(cat.name, icon); });
        list.appendChild(item);
    });

    // "+ Add New Category" at the bottom
    const addNew = document.createElement('div');
    addNew.className = 'cat-search-item cat-search-add-new';
    addNew.innerHTML =
        '<span class="cat-search-item-icon">\u2795</span>' +
        '<span class="cat-search-item-name">Add New Category</span>';
    addNew.addEventListener('click', function() {
        closeCatSearchDropdown();
        const categoriesModalEl = document.getElementById('categoriesModal');
        if (window.openCategoriesModal && categoriesModalEl) {
            const transactionModalEl = document.getElementById('addTransactionModal');
            const transactionModal = bootstrap.Modal.getInstance(transactionModalEl);
            if (transactionModal) transactionModal.hide();
            const typeInput = document.querySelector('input[name="transaction-type"]:checked');
            const type = typeInput ? typeInput.value : 'expense';
            window.openCategoriesModal();
            setTimeout(function() {
                const catTab = document.getElementById('cat-tab-' + type);
                if (catTab) catTab.click();
            }, 200);
            function handleHidden() {
                if (transactionModal) transactionModal.show();
                categoriesModalEl.removeEventListener('hidden.bs.modal', handleHidden);
            }
            categoriesModalEl.addEventListener('hidden.bs.modal', handleHidden);
        }
    });
    list.appendChild(addNew);
};

window.selectCatSearchOption = function(value, icon) {
    const hiddenInput = document.getElementById('transaction-category');
    const display = document.getElementById('cat-search-display');
    if (hiddenInput) {
        hiddenInput.value = value;
        hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (display) {
        display.innerHTML =
            '<span class="cat-search-item-icon me-2">' + (icon || '\uD83C\uDFF7\uFE0F') + '</span>' +
            '<span>' + value + '</span>';
    }
    // Highlight selected
    document.querySelectorAll('#cat-search-list .cat-search-item').forEach(function(el) {
        el.classList.toggle('selected', el.dataset.value === value);
    });
    closeCatSearchDropdown();
};

window.setCatSearchValue = function(value) {
    if (!value) {
        window.resetCatSearchPicker();
        return;
    }
    const cats = window._catSearchAllCategories || [];
    const cat = cats.find(function(c) { return c.name === value; });
    const icon = (cat && cat.icon) ? cat.icon :
        (window.getCategoryIcon ? window.getCategoryIcon(value) : '\uD83C\uDFF7\uFE0F');
    if (cats.length > 0) window.renderCatSearchList(cats);
    window.selectCatSearchOption(value, icon);
};

window.resetCatSearchPicker = function() {
    const hiddenInput = document.getElementById('transaction-category');
    const display = document.getElementById('cat-search-display');
    const searchInput = document.getElementById('cat-search-input');
    if (hiddenInput) hiddenInput.value = '';
    if (display) display.innerHTML = '<span class="cat-search-placeholder">Select Category\u2026</span>';
    if (searchInput) searchInput.value = '';
    if (window._catSearchAllCategories) window.renderCatSearchList(window._catSearchAllCategories);
    closeCatSearchDropdown();
};

window.toggleCatSearchDropdown = function() {
    const dropdown = document.getElementById('cat-search-dropdown');
    const chevron = document.getElementById('cat-search-chevron');
    if (!dropdown) return;
    if (dropdown.classList.contains('open')) {
        closeCatSearchDropdown();
    } else {
        dropdown.classList.add('open');
        if (chevron) chevron.classList.add('rotated');
        const searchInput = document.getElementById('cat-search-input');
        if (searchInput) setTimeout(function() { searchInput.focus(); }, 50);
        setTimeout(function() {
            document.addEventListener('click', _catSearchOutsideClick, { once: true });
        }, 0);
    }
};

function closeCatSearchDropdown() {
    const dropdown = document.getElementById('cat-search-dropdown');
    const chevron = document.getElementById('cat-search-chevron');
    if (dropdown) dropdown.classList.remove('open');
    if (chevron) chevron.classList.remove('rotated');
}

function _catSearchOutsideClick(e) {
    const picker = document.getElementById('cat-search-picker');
    if (picker && !picker.contains(e.target)) {
        closeCatSearchDropdown();
    }
}

window.filterCatSearchOptions = function(query) {
    if (!window._catSearchAllCategories) return;
    if (!query.trim()) {
        window.renderCatSearchList(window._catSearchAllCategories);
        return;
    }
    const lower = query.toLowerCase();
    const filtered = window._catSearchAllCategories.filter(function(c) {
        return (c.name || '').toLowerCase().includes(lower);
    });
    window.renderCatSearchList(filtered);
};
