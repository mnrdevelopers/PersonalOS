let currentGroceryTab = 'list'; // list, inventory, history
let groceryItems = [];
let groceryCart = new Set(); // IDs of items selected for checkout
let grocerySearchQuery = '';
let groceryFilterCategory = 'all';

const GROCERY_CATEGORIES = {
    'Fruits & Vegetables': '🥦',
    'Dairy, Bread & Eggs': '🍞',
    'Masalas & Spices': '🌶️',
    'Flours & Grains': '🌾',
    'Oils & Ghee': '🪔',
    'Meat & Fish': '🥩',
    'Snacks & Biscuits': '🍪',
    'Beverages': '🥤',
    'Cleaning & Household': '🧼',
    'Personal Care': '🧴',
    'Baby Care': '👶',
    'Pet Care': '🐾',
    'Other': '📦'
};

const GROCERY_UNITS = ['pcs', 'kg', 'g', 'l', 'ml', 'dozen', 'pack', 'bottle', 'box', 'can'];

const GROCERY_CATALOG = {
  "Fruits": ["Apple","Banana","Orange","Mango","Grapes","Papaya","Pineapple","Guava","Watermelon","Muskmelon","Pomegranate","Kiwi","Strawberry","Chikoo","Custard Apple","Lemon","Sweet Lime","Peach","Plum"],
  "Vegetables": ["Potato","Tomato","Onion","Carrot","Beetroot","Radish","Cabbage","Cauliflower","Broccoli","Spinach","Fenugreek","Coriander","Green Chilli","Capsicum","Brinjal","Lady Finger","Pumpkin","Bottle Gourd","Ridge Gourd","Bitter Gourd","Cucumber","Beans","Cluster Beans","Drumstick","Sweet Corn","Mushroom"],
  "Grains & Staples": ["Rice","Basmati Rice","Brown Rice","Wheat","Wheat Flour","Maida","Rava","Jowar","Bajra","Oats","Barley","Corn Flour"],
  "Pulses & Lentils": ["Toor Dal","Moong Dal","Masoor Dal","Urad Dal","Chana Dal","Rajma","Kabuli Chana","Black Chana","Green Gram","Black Gram","Lobia","Soya Beans","Peas"],
  "Dairy": ["Milk","Curd","Yogurt","Butter","Ghee","Paneer","Cheese","Cream","Buttermilk","Condensed Milk"],
  "Oils & Fats": ["Sunflower Oil","Groundnut Oil","Mustard Oil","Coconut Oil","Olive Oil","Palm Oil","Rice Bran Oil","Ghee"],
  "Spices": ["Salt","Turmeric","Chilli Powder","Coriander Powder","Cumin","Mustard Seeds","Fenugreek","Black Pepper","Cloves","Cinnamon","Cardamom","Bay Leaf","Garam Masala","Sambar Powder","Rasam Powder"],
  "Snacks & Packaged": ["Chips","Biscuits","Cookies","Namkeen","Mixture","Murukku","Popcorn","Noodles","Pasta","Macaroni","Instant Soup"],
  "Beverages": ["Tea","Coffee","Green Tea","Soft Drink","Fruit Juice","Energy Drink","Milkshake","Coconut Water","Lassi"],
  "Bakery": ["Bread","Brown Bread","Buns","Pav","Cake","Pastry","Croissant","Donut"],
  "Frozen Foods": ["Frozen Peas","Frozen Corn","Frozen Veg Mix","Ice Cream","Frozen Paratha","Frozen Fries"],
  "Meat & Eggs": ["Eggs","Chicken","Mutton","Fish","Prawns","Crab","Sausage","Bacon"],
  "Personal Care": ["Soap","Shampoo","Conditioner","Toothpaste","Toothbrush","Face Wash","Body Lotion","Deodorant","Razor","Shaving Cream"],
  "Household": ["Detergent","Dish Wash","Floor Cleaner","Toilet Cleaner","Phenyl","Bleach","Garbage Bags","Aluminium Foil","Tissues","Paper Towels"],
  "Baby Products": ["Baby Food","Baby Diapers","Baby Wipes","Baby Soap","Baby Shampoo","Baby Oil"],
  "Pet Supplies": ["Dog Food","Cat Food","Pet Shampoo","Pet Treats","Pet Litter"]
};

const CATALOG_MAPPING = {
    "Fruits": "Fruits & Vegetables",
    "Vegetables": "Fruits & Vegetables",
    "Grains & Staples": "Flours & Grains",
    "Pulses & Lentils": "Flours & Grains",
    "Dairy": "Dairy, Bread & Eggs",
    "Oils & Fats": "Oils & Ghee",
    "Spices": "Masalas & Spices",
    "Snacks & Packaged": "Snacks & Biscuits",
    "Beverages": "Beverages",
    "Bakery": "Dairy, Bread & Eggs",
    "Frozen Foods": "Other",
    "Meat & Eggs": "Meat & Fish",
    "Personal Care": "Personal Care",
    "Household": "Cleaning & Household",
    "Baby Products": "Baby Care",
    "Pet Supplies": "Pet Care"
};

async function calculateAndDisplayGroceryStats() {
    const user = auth.currentUser;
    if (!user) return;

}

window.autoSelectCategory = function(itemName) {
    if (!itemName) return;
    const lowerName = itemName.toLowerCase();
    
    // Special case for Eggs (map to Dairy/Bread/Eggs instead of Meat/Fish if preferred, or keep as is)
    if (lowerName === 'eggs') {
        document.getElementById('grocery-category').value = 'Dairy, Bread & Eggs';
        return;
    }

    for (const [catKey, items] of Object.entries(GROCERY_CATALOG)) {
        if (items.some(i => i.toLowerCase() === lowerName)) {
            const targetCat = CATALOG_MAPPING[catKey];
            if (targetCat) {
                document.getElementById('grocery-category').value = targetCat;
            }
            break;
        }
    }
};

window.loadGroceriesSection = async function() {
    const container = document.getElementById('groceries-section');
    
    // Generate datalist options
    let datalistOptions = '';
    Object.values(GROCERY_CATALOG).forEach(items => {
        items.forEach(item => {
            datalistOptions += `<option value="${item}">`;
        });
    });

    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold gradient-text mb-0">Grocery Tracker</h2>
            <div>
                <div class="btn-group me-2">
                    <button class="btn btn-outline-primary" onclick="showAddGroceryItemModal()">
                        <i class="fas fa-plus me-2"></i>Add Item
                    </button>
                    <button type="button" class="btn btn-outline-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                        <span class="visually-hidden">Toggle Dropdown</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="javascript:void(0)" onclick="importCatalog()"><i class="fas fa-file-import me-2"></i>Import Catalog to Inventory</a></li>
                    </ul>
                </div>
                <button class="btn btn-success" id="btn-checkout-fab" onclick="initiateCheckout()" style="display: none;">
                    <i class="fas fa-shopping-cart me-2"></i>Checkout (<span id="cart-count">0</span>)
                </button>
            </div>
        </div>

        <!-- Stats Row -->
        <div class="row g-4 mb-4">
            <div class="col-md-4">
                <div class="card border-0 shadow-sm h-100 bg-primary bg-opacity-10">
                    <div class="card-body">
                        <h6 class="text-primary fw-bold text-uppercase small">To Buy</h6>
                        <h3 class="mb-0" id="stat-to-buy">0 Items</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card border-0 shadow-sm h-100 bg-success bg-opacity-10">
                    <div class="card-body">
                        <h6 class="text-success fw-bold text-uppercase small">Monthly Spend</h6>
                        <h3 class="mb-0" id="stat-month-spend">₹0.00</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card border-0 shadow-sm h-100 bg-warning bg-opacity-10">
                    <div class="card-body">
                        <h6 class="text-warning fw-bold text-uppercase small text-dark">In Stock</h6>
                        <h3 class="mb-0 text-dark" id="stat-in-stock">0 Items</h3>
                    </div>
                </div>
            </div>
        </div>

        <!-- Top Items Row -->
        <div id="top-items-container" class="mb-4" style="display: none;">
            <h6 class="fw-bold text-muted text-uppercase small mb-3">Most Frequently Bought</h6>
            <div class="row g-3" id="top-items-list"></div>
        </div>

        <!-- Search & Filter -->
        <div class="row g-2 mb-3">
            <div class="col-md-8">
                <div class="input-group">
                    <span class="input-group-text bg-white"><i class="fas fa-search text-muted"></i></span>
                    <input type="text" class="form-control" placeholder="Search items..." onkeyup="searchGroceries(this.value)">
                </div>
            </div>
            <div class="col-md-4">
                <select class="form-select" onchange="filterGroceriesByCategory(this.value)">
                    <option value="all">All Categories</option>
                    ${Object.keys(GROCERY_CATEGORIES).map(cat => `<option value="${cat}">${GROCERY_CATEGORIES[cat]} ${cat}</option>`).join('')}
                </select>
            </div>
        </div>

        <ul class="nav nav-tabs mb-4">
            <li class="nav-item">
                <a class="nav-link active" href="javascript:void(0)" onclick="switchGroceryTab('list', this)">Shopping List</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="javascript:void(0)" onclick="switchGroceryTab('inventory', this)">Pantry / Inventory</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="javascript:void(0)" onclick="switchGroceryTab('history', this)">Purchase History</a>
            </li>
        </ul>

        <div id="grocery-content" class="row g-3">
            <div class="col-12 text-center"><div class="spinner-border text-primary"></div></div>
        </div>

        <!-- Add Item Modal -->
        <div class="modal fade" id="addGroceryItemModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="groceryModalTitle">Add Grocery Item</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="grocery-item-form">
                            <input type="hidden" id="grocery-id">
                            <div class="mb-3">
                                <label class="form-label">Item Name</label>
                                <input type="text" class="form-control" id="grocery-name" list="grocery-suggestions" placeholder="e.g. Milk, Rice, Toothpaste" required oninput="autoSelectCategory(this.value)">
                                <datalist id="grocery-suggestions">${datalistOptions}</datalist>
                            </div>
                            <div class="row">
                                <div class="col-7 mb-3">
                                    <label class="form-label">Category</label>
                                    <select class="form-select" id="grocery-category">
                                        ${Object.keys(GROCERY_CATEGORIES).map(cat => `<option value="${cat}">${GROCERY_CATEGORIES[cat]} ${cat}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="col-5 mb-3">
                                    <label class="form-label">Unit</label>
                                    <select class="form-select" id="grocery-unit">
                                        ${GROCERY_UNITS.map(u => `<option value="${u}">${u}</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Default Status</label>
                                <select class="form-select" id="grocery-status">
                                    <option value="to_buy">Add to Shopping List</option>
                                    <option value="in_stock">Already In Stock</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="btn-save-grocery" onclick="saveGroceryItem()">Save Item</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Checkout Modal -->
        <div class="modal fade" id="checkoutModal" tabindex="-1">
            <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Checkout / Record Purchase</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Date</label>
                                <input type="date" class="form-control" id="checkout-date" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Store / Supermarket</label>
                                <input type="text" class="form-control" id="checkout-store" placeholder="e.g. DMart, BigBasket">
                            </div>
                        </div>
                        
                        <div class="table-responsive mb-3">
                            <table class="table table-sm align-middle">
                                <thead class="table-light">
                                    <tr>
                                        <th>Item</th>
                                        <th style="width: 150px;">Qty & Unit</th>
                                        <th style="width: 120px;">Price/Unit (₹)</th>
                                        <th style="width: 120px;" class="text-end">Total (₹)</th>
                                    </tr>
                                </thead>
                                <tbody id="checkout-items-body">
                                    <!-- Items populated via JS -->
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="3" class="text-end fw-bold">Grand Total:</td>
                                        <td class="fw-bold text-primary text-end" id="checkout-total">₹0.00</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" id="checkout-ledger" checked>
                            <label class="form-check-label" for="checkout-ledger">
                                Add expense to Finance Ledger
                            </label>
                        </div>
                        <div class="mb-3" id="checkout-payment-div">
                            <label class="form-label">Payment Mode</label>
                            <select class="form-select" id="checkout-payment-mode">
                                <option value="upi">UPI</option>
                                <option value="card">Card</option>
                                <option value="cash">Cash</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" id="btn-confirm-checkout" onclick="confirmCheckout()">
                            <i class="fas fa-check-circle me-2"></i>Complete Purchase
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit Log Modal -->
        <div class="modal fade" id="editGroceryLogModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Purchase Log</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="edit-grocery-log-form">
                            <input type="hidden" id="edit-log-id">
                            <div class="mb-3">
                                <label class="form-label">Date</label>
                                <input type="date" class="form-control" id="edit-log-date" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Store</label>
                                <input type="text" class="form-control" id="edit-log-store">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Total Amount (₹)</label>
                                <input type="number" class="form-control" id="edit-log-total" step="0.01">
                                <div class="form-text">Updating this will update the linked transaction.</div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="btn-save-log-edit" onclick="saveGroceryLogEdit()">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    await loadGroceryData();
};

window.switchGroceryTab = function(tab, element) {
    currentGroceryTab = tab;
    document.querySelectorAll('#groceries-section .nav-link').forEach(l => l.classList.remove('active'));
    element.classList.add('active');
    renderGroceryView();
};

window.searchGroceries = function(query) {
    grocerySearchQuery = query.toLowerCase();
    renderGroceryView();
};

window.filterGroceriesByCategory = function(category) {
    groceryFilterCategory = category;
    renderGroceryView();
};

async function calculateAndDisplayGroceryStats() {
    const user = auth.currentUser;
    if (!user) return;

    // Calculate local stats from groceryItems array
    const toBuyCount = groceryItems.filter(i => i.status === 'to_buy').length;
    const inStockCount = groceryItems.filter(i => i.status === 'in_stock').length;
    
    document.getElementById('stat-to-buy').textContent = `${toBuyCount} Items`;
    document.getElementById('stat-in-stock').textContent = `${inStockCount} Items`;

    // Calculate Monthly Spend from DB
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    
    const logsSnap = await db.collection('grocery_logs')
        .where('userId', '==', user.uid)
        .where('date', '>=', startOfMonth.toISOString().split('T')[0])
        .get();
        
    let monthSpend = 0;
    logsSnap.forEach(doc => monthSpend += (doc.data().totalAmount || 0));
    document.getElementById('stat-month-spend').textContent = `₹${monthSpend.toFixed(2)}`;
}

window.loadGroceryData = async function() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        // Fetch Items
        const itemsSnap = await db.collection('grocery_items')
            .where('userId', '==', user.uid)
            .orderBy('name')
            .get();
        
        groceryItems = [];
        itemsSnap.forEach(doc => {
            groceryItems.push({ id: doc.id, ...doc.data() });
        });

        await calculateAndDisplayGroceryStats();
        await loadTopItems();
        renderGroceryView();

    } catch (e) {
        console.error("Error loading groceries:", e);
    }
};

window.renderGroceryView = function() {
    const container = document.getElementById('grocery-content');
    const checkoutBtn = document.getElementById('btn-checkout-fab');
    
    // Reset Cart UI
    groceryCart.clear();
    updateCartUI();

    // Apply Filters
    let filteredItems = groceryItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(grocerySearchQuery);
        const matchesCategory = groceryFilterCategory === 'all' || item.category === groceryFilterCategory;
        return matchesSearch && matchesCategory;
    });

    if (currentGroceryTab === 'list') {
        checkoutBtn.style.display = 'inline-block';
        const itemsToBuy = filteredItems.filter(i => i.status === 'to_buy');
        
        if (itemsToBuy.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-shopping-basket fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">Shopping list is empty!</h5>
                    <p class="small text-muted">Add items or check your inventory to replenish.</p>
                </div>`;
            return;
        }

        // Group by Category
        const grouped = {};
        itemsToBuy.forEach(item => {
            if (!grouped[item.category]) grouped[item.category] = [];
            grouped[item.category].push(item);
        });

        let html = '';
        for (const [cat, items] of Object.entries(grouped)) {
            const icon = GROCERY_CATEGORIES[cat] || '📦';
            html += `
                <div class="col-12 mb-2">
                    <h6 class="fw-bold text-muted border-bottom pb-2 mt-2">${icon} ${cat}</h6>
                </div>
            `;
            items.forEach(item => {
                const lastPrice = item.lastCost ? `₹${item.lastCost}` : '-';
                const duration = item.typicalDuration ? `${item.typicalDuration} days` : 'New';
                const unitText = item.unit ? ` / ${item.unit}` : '';

                const actionMenu = `
                    <div class="dropdown ms-2" onclick="event.stopPropagation()">
                        <button class="btn btn-link text-muted p-0" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-v"></i></button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="javascript:void(0)" onclick="editGroceryItem('${item.id}')">Edit</a></li>
                            <li><a class="dropdown-item" href="javascript:void(0)" onclick="removeFromList('${item.id}')"><i class="fas fa-minus-circle me-2 text-warning"></i>Remove from List</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="deleteGroceryItem('${item.id}')"><i class="fas fa-trash me-2"></i>Delete Permanently</a></li>
                        </ul>
                    </div>`;

                html += `
                    <div class="col-md-6 col-lg-4">
                        <div class="card h-100 shadow-sm border-start border-4 border-primary grocery-card" onclick="toggleCartItem('${item.id}', this)">
                            <div class="card-body d-flex align-items-center">
                                <div class="form-check pointer-events-none">
                                    <input class="form-check-input" type="checkbox" id="check-${item.id}">
                                </div>
                                <div class="ms-3 flex-grow-1">
                                    <h6 class="mb-0 fw-bold">${item.name}</h6>
                                    <div class="d-flex justify-content-between small text-muted mt-1">
                                        <span>Last: ${lastPrice}${unitText}</span>
                                        <span>Avg Life: ${duration}</span>
                                    </div>
                                </div>
                                <button class="btn btn-link text-muted p-0 me-2" onclick="event.stopPropagation(); removeFromList('${item.id}')" title="Return to Inventory">
                                    <i class="fas fa-undo"></i>
                                </button>
                                ${actionMenu}
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        container.innerHTML = html;

    } else if (currentGroceryTab === 'inventory') {
        checkoutBtn.style.display = 'none';
        const inStock = filteredItems.filter(i => i.status === 'in_stock');
        
        if (inStock.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-muted py-5">Pantry is empty. Go shopping!</div>';
            return;
        }

        // Sort by purchase date (oldest first) to encourage usage
        inStock.sort((a, b) => {
            const dateA = a.lastPurchased ? new Date(a.lastPurchased) : new Date(0);
            const dateB = b.lastPurchased ? new Date(b.lastPurchased) : new Date(0);
            return dateA - dateB;
        });

        let html = '';
        inStock.forEach(item => {
            const icon = GROCERY_CATEGORIES[item.category] || '📦';
            
            // Calculate days since purchase
            let daysHeld = 0;
            let progressHtml = '';
            
            if (item.lastPurchased) {
                const purchased = new Date(item.lastPurchased);
                const today = new Date();
                daysHeld = Math.floor((today - purchased) / (1000 * 60 * 60 * 24));
                
                // Progress bar based on typical duration
                if (item.typicalDuration) {
                    const percent = Math.min(100, (daysHeld / item.typicalDuration) * 100);
                    let color = 'bg-success';
                    if (percent > 75) color = 'bg-warning';
                    if (percent >= 100) color = 'bg-danger';
                    
                    progressHtml = `
                        <div class="progress mt-2" style="height: 4px;">
                            <div class="progress-bar ${color}" role="progressbar" style="width: ${percent}%"></div>
                        </div>
                        <div class="d-flex justify-content-between small text-muted mt-1" style="font-size: 0.7rem;">
                            <span>Held: ${daysHeld} days</span>
                            <span>Est: ${item.typicalDuration} days</span>
                        </div>
                    `;
                } else {
                    progressHtml = `<div class="small text-muted mt-1" style="font-size: 0.7rem;">Held: ${daysHeld} days</div>`;
                }
            }

            const actionMenu = `
                <div class="dropdown ms-2">
                    <button class="btn btn-link text-muted p-0" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-v"></i></button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="javascript:void(0)" onclick="editGroceryItem('${item.id}')">Edit</a></li>
                        <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="deleteGroceryItem('${item.id}')">Delete</a></li>
                    </ul>
                </div>`;

            html += `
                <div class="col-md-6 col-lg-3">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <div class="mb-1">${icon} <span class="fw-bold">${item.name}</span></div>
                                    <span class="badge bg-light text-dark border">${item.category}</span>
                                </div>
                                <button class="btn btn-sm btn-outline-danger" onclick="consumeItem('${item.id}')" title="Mark as Finished / Add to List">
                                    <i class="fas fa-cart-plus"></i>
                                </button>
                                ${actionMenu}
                            </div>
                            ${progressHtml}
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;

    } else if (currentGroceryTab === 'history') {
        checkoutBtn.style.display = 'none';
        loadGroceryHistory();
    }
};

window.toggleCartItem = function(id, cardElement) {
    const checkbox = document.getElementById(`check-${id}`);
    
    if (groceryCart.has(id)) {
        groceryCart.delete(id);
        cardElement.classList.remove('border-success', 'bg-success', 'bg-opacity-10');
        cardElement.classList.add('border-primary');
        checkbox.checked = false;
    } else {
        groceryCart.add(id);
        cardElement.classList.remove('border-primary');
        cardElement.classList.add('border-success', 'bg-success', 'bg-opacity-10');
        checkbox.checked = true;
    }
    updateCartUI();
};

window.updateCartUI = function() {
    const count = groceryCart.size;
    document.getElementById('cart-count').textContent = count;
    const btn = document.getElementById('btn-checkout-fab');
    if (currentGroceryTab === 'list') {
        btn.disabled = count === 0;
        btn.classList.toggle('btn-success', count > 0);
        btn.classList.toggle('btn-secondary', count === 0);
    }
};

window.showAddGroceryItemModal = function() {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addGroceryItemModal'));
    document.getElementById('grocery-item-form').reset();
    document.getElementById('grocery-id').value = '';
    document.getElementById('groceryModalTitle').textContent = 'Add Grocery Item';
    document.getElementById('btn-save-grocery').textContent = 'Save Item';
    document.getElementById('btn-save-grocery').disabled = false;
    document.getElementById('grocery-status').value = 'to_buy'; // Default
    modal.show();
};

window.saveGroceryItem = async function() {
    const btn = document.getElementById('btn-save-grocery');
    const user = auth.currentUser;
    const id = document.getElementById('grocery-id').value;
    const name = document.getElementById('grocery-name').value.trim();
    const category = document.getElementById('grocery-category').value;
    const unit = document.getElementById('grocery-unit').value;
    const status = document.getElementById('grocery-status').value;
    
    if (!name) return;

    try {
        window.setBtnLoading(btn, true);
        const newItemData = {
            userId: user.uid,
            name, category, unit, status,
        };
        
        if (id) {
            newItemData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('grocery_items').doc(id).update(newItemData);
            
            // Update local array
            const index = groceryItems.findIndex(i => i.id === id);
            if (index !== -1) {
                groceryItems[index] = { ...groceryItems[index], ...newItemData };
            }
        } else {
            newItemData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const docRef = await db.collection('grocery_items').add(newItemData);
            
            // Add to local state
            groceryItems.push({ id: docRef.id, ...newItemData });
        }
        
        // Sort the array again to maintain order
        groceryItems.sort((a, b) => a.name.localeCompare(b.name));
        
        bootstrap.Modal.getInstance(document.getElementById('addGroceryItemModal')).hide();
        renderGroceryView(); // Re-render with local data
        await calculateAndDisplayGroceryStats(); // Update stats

        if(window.dashboard) window.dashboard.showNotification(id ? 'Item updated' : 'Item added', 'success');
        window.setBtnLoading(btn, false);
    } catch (e) {
        console.error(e);
        window.setBtnLoading(btn, false);
        if(window.dashboard) window.dashboard.showNotification('Failed to add item', 'danger');
    }
};

window.editGroceryItem = function(id) {
    const item = groceryItems.find(i => i.id === id);
    if (!item) return;

    document.getElementById('grocery-id').value = id;
    document.getElementById('grocery-name').value = item.name;
    document.getElementById('grocery-category').value = item.category;
    document.getElementById('grocery-unit').value = item.unit || 'pcs';
    document.getElementById('grocery-status').value = item.status;

    document.getElementById('groceryModalTitle').textContent = 'Edit Grocery Item';
    document.getElementById('btn-save-grocery').textContent = 'Update Item';
    document.getElementById('btn-save-grocery').disabled = false;

    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addGroceryItemModal'));
    modal.show();
};

window.removeFromList = async function(id) {
    // Optimistic update for speed
    const item = groceryItems.find(i => i.id === id);
    if (item) item.status = 'in_stock';
    renderGroceryView();
    calculateAndDisplayGroceryStats();

    try {
        await db.collection('grocery_items').doc(id).update({
            status: 'in_stock',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        if(window.dashboard) window.dashboard.showNotification('Item moved to inventory', 'info');
    } catch (e) {
        console.error(e);
        if(window.dashboard) window.dashboard.showNotification('Error removing item', 'danger');
    }
};

window.deleteGroceryItem = async function(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    if (!confirm('Are you sure you want to delete this item permanently? If you just want to remove it from the list, use "Remove from List".')) return;

    try {
        await db.collection('grocery_items').doc(id).delete();
        
        // Remove from local array
        groceryItems = groceryItems.filter(i => i.id !== id);
        
        renderGroceryView();
        await calculateAndDisplayGroceryStats();
        
        if(window.dashboard) window.dashboard.showNotification('Item deleted', 'success');
    } catch (e) {
        console.error(e);
        if(window.dashboard) window.dashboard.showNotification('Error deleting item', 'danger');
    }
};

window.initiateCheckout = function() {
    if (groceryCart.size === 0) return;
    
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('checkoutModal'));
    const tbody = document.getElementById('checkout-items-body');
    tbody.innerHTML = '';
    
    document.getElementById('checkout-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('checkout-store').value = '';
    
    groceryCart.forEach(id => {
        const item = groceryItems.find(i => i.id === id);
        if (item) {
            const unitOptions = GROCERY_UNITS.map(u => `<option value="${u}" ${u === (item.unit || 'pcs') ? 'selected' : ''}>${u}</option>`).join('');
            const tr = document.createElement('tr');
            tr.dataset.id = id;
            tr.innerHTML = `
                <td>
                    <div class="fw-bold">${item.name}</div>
                </td>
                <td>
                    <div class="input-group input-group-sm">
                        <input type="number" class="form-control checkout-input" data-field="qty" value="1" min="0.1" step="0.1" oninput="calculateCheckoutTotal()">
                        <select class="form-select checkout-input bg-light" data-field="unit" style="max-width: 75px; padding-left: 5px; padding-right: 0;">
                            ${unitOptions}
                        </select>
                    </div>
                </td>
                <td><input type="number" class="form-control form-control-sm checkout-input" data-field="price" placeholder="0.00" step="0.01" oninput="calculateCheckoutTotal()"></td>
                <td class="text-end fw-medium" data-field="total">₹0.00</td>
            `;
            tbody.appendChild(tr);
        }
    });
    
    calculateCheckoutTotal(); // Initial calculation
    modal.show();
};

window.calculateCheckoutTotal = function() {
    let grandTotal = 0;
    document.querySelectorAll('#checkout-items-body tr').forEach(tr => {
        const qty = parseFloat(tr.querySelector('[data-field="qty"]').value) || 0;
        const price = parseFloat(tr.querySelector('[data-field="price"]').value) || 0;
        const lineTotal = qty * price;
        
        tr.querySelector('[data-field="total"]').textContent = `₹${lineTotal.toFixed(2)}`;
        grandTotal += lineTotal;
    });
    
    document.getElementById('checkout-total').textContent = `₹${grandTotal.toFixed(2)}`;
    return grandTotal;
};

window.confirmCheckout = async function() {
    const btn = document.getElementById('btn-confirm-checkout');
    const user = auth.currentUser;
    const date = document.getElementById('checkout-date').value;
    const store = document.getElementById('checkout-store').value;
    const addToLedger = document.getElementById('checkout-ledger').checked;
    const paymentMode = document.getElementById('checkout-payment-mode').value;
    
    const items = [];
    let totalAmount = 0;
    
    document.querySelectorAll('#checkout-items-body tr').forEach(tr => {
        const id = tr.dataset.id;
        const qty = parseFloat(tr.querySelector('[data-field="qty"]').value) || 0;
        const unit = tr.querySelector('[data-field="unit"]').value;
        const pricePerUnit = parseFloat(tr.querySelector('[data-field="price"]').value) || 0;
        const lineTotal = qty * pricePerUnit;
        
        if (id && lineTotal > 0) {
            const itemDef = groceryItems.find(i => i.id === id);
            items.push({
                id,
                name: itemDef.name,
                category: itemDef.category,
                unit: unit, // Use the unit selected at checkout
                quantity: qty,
                pricePerUnit: pricePerUnit,
                totalCost: lineTotal
            });
            totalAmount += lineTotal;
        }
    });
    if (totalAmount <= 0 && !confirm("Total amount is 0. Continue?")) return;

    try {
        window.setBtnLoading(btn, true);
        const batch = db.batch();
        
        // 1. Create Log
        const logRef = db.collection('grocery_logs').doc();
        batch.set(logRef, {
            userId: user.uid,
            date, store, totalAmount, items,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 2. Update Items (Status -> in_stock, lastPurchased, lastCost)
        items.forEach(item => {
            const itemRef = db.collection('grocery_items').doc(item.id);
            batch.update(itemRef, {
                status: 'in_stock',
                lastPurchased: date,
                lastCost: item.pricePerUnit, // Save price per unit as lastCost
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });

        // 3. Add to Ledger (Optional)
        if (addToLedger && totalAmount > 0) {
            const txRef = db.collection('transactions').doc();
            batch.set(txRef, {
                userId: user.uid,
                date,
                amount: totalAmount,
                type: 'expense',
                category: 'Groceries',
                description: `Grocery Run: ${store || 'Supermarket'} (${items.length} items)`,
                paymentMode,
                relatedId: logRef.id,
                section: 'groceries',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        await batch.commit();
        
        window.setBtnLoading(btn, false);
        bootstrap.Modal.getInstance(document.getElementById('checkoutModal')).hide();
        await loadGroceryData(); // Full reload after a big update like checkout is fine.
        if(window.dashboard) window.dashboard.showNotification('Purchase recorded!', 'success');
        if(window.dashboard) window.dashboard.updateStats();

    } catch (e) {
        window.setBtnLoading(btn, false);
        console.error("Checkout error:", e);
        if(window.dashboard) window.dashboard.showNotification('Error processing checkout', 'danger');
    }
};

window.consumeItem = async function(id) {
    const item = groceryItems.find(i => i.id === id);
    if (!item) return;

    try {
        const updateData = {
            status: 'to_buy',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Calculate duration logic
        if (item.lastPurchased) {
            const purchased = new Date(item.lastPurchased);
            const today = new Date();
            const daysLasted = Math.floor((today - purchased) / (1000 * 60 * 60 * 24));
            
            if (daysLasted > 0) {
                // Simple moving average for duration
                const currentAvg = item.typicalDuration || daysLasted;
                updateData.typicalDuration = Math.round((currentAvg + daysLasted) / 2);
            }
        }

        await db.collection('grocery_items').doc(id).update(updateData);
        loadGroceryData();
        if(window.dashboard) window.dashboard.showNotification(`${item.name} moved to shopping list`, 'info');

    } catch (e) {
        console.error(e);
    }
};

window.loadGroceryHistory = async function() {
    const container = document.getElementById('grocery-content');
    const user = auth.currentUser;
    
    const snapshot = await db.collection('grocery_logs')
        .where('userId', '==', user.uid)
        .orderBy('date', 'desc')
        .limit(20)
        .get();

    if (snapshot.empty) {
        container.innerHTML = '<div class="col-12 text-center text-muted py-5">No purchase history found.</div>';
        return;
    }

    let html = '<div class="col-12"><div class="list-group">';
    snapshot.forEach(doc => {
        const data = doc.data();
        const itemCount = data.items ? data.items.length : 0;
        
        html += `
            <div class="list-group-item p-3 mb-2 border rounded-3">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1 fw-bold">${data.store || 'Supermarket'}</h6>
                        <div class="small text-muted">
                            <i class="far fa-calendar me-1"></i> ${new Date(data.date).toLocaleDateString()} 
                            <span class="mx-2">•</span> 
                            <i class="fas fa-shopping-basket me-1"></i> ${itemCount} items
                        </div>
                    </div>
                    <div class="text-end">
                        <h5 class="mb-0 text-success">₹${data.totalAmount.toFixed(2)}</h5>
                        <div class="d-flex align-items-center justify-content-end gap-2">
                            <button class="btn btn-sm btn-link text-decoration-none p-0" type="button" data-bs-toggle="collapse" data-bs-target="#log-${doc.id}" aria-expanded="false">
                                Details <i class="fas fa-chevron-down small"></i>
                            </button>
                            <div class="dropdown">
                                <button class="btn btn-link text-muted p-0" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-v"></i></button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li><a class="dropdown-item" href="javascript:void(0)" onclick="editGroceryLog('${doc.id}')">Edit</a></li>
                                    <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="deleteGroceryLog('${doc.id}')">Delete</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="collapse mt-2" id="log-${doc.id}">
                    <div class="card card-body bg-light border-0 small">
                        <ul class="list-unstyled mb-0">
                            ${data.items.map(i => {
                                const qty = i.quantity || 1;
                                const unit = i.unit || 'pcs';
                                const total = i.totalCost || i.cost || 0; // Handle old and new format
                                const pricePer = i.pricePerUnit ? `@ ₹${i.pricePerUnit.toFixed(2)}/${unit}` : '';

                                return `
                                    <li class="d-flex justify-content-between border-bottom py-1">
                                        <div>
                                            ${i.name} 
                                            <span class="text-muted" style="font-size: 0.8em;">(${qty} ${unit} ${pricePer})</span>
                                        </div>
                                        <span>₹${total.toFixed(2)}</span>
                                    </li>
                                `;
                            }).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div></div>';
    container.innerHTML = html;
};

window.importCatalog = async function() {
    if (!confirm("Import all catalog items to your Inventory? This will add many items.")) return;
    
    const user = auth.currentUser;
    if (!user) return;
    
    if (window.dashboard) window.dashboard.showLoading();

    try {
        const batch = db.batch();
        let count = 0;
        const existingNames = new Set(groceryItems.map(i => i.name.toLowerCase()));

        for (const [catKey, items] of Object.entries(GROCERY_CATALOG)) {
            const category = CATALOG_MAPPING[catKey] || 'Other';
            
            for (const name of items) {
                if (!existingNames.has(name.toLowerCase())) {
                    const docRef = db.collection('grocery_items').doc();
                    batch.set(docRef, {
                        userId: user.uid,
                        name: name,
                        category: category,
                        status: 'in_stock',
                        unit: 'pcs',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    count++;
                }
            }
        }

        if (count > 0) {
            await batch.commit();
            await loadGroceryData();
            if (window.dashboard) window.dashboard.showNotification(`Imported ${count} items`, 'success');
        } else {
            if (window.dashboard) window.dashboard.showNotification('Items already exist', 'info');
        }
    } catch (e) {
        console.error(e);
        if (window.dashboard) window.dashboard.showNotification('Import failed', 'danger');
    } finally {
        if (window.dashboard) window.dashboard.hideLoading();
    }
};

window.deleteGroceryLog = async function(id) {
    if (!confirm('Are you sure you want to delete this purchase record? This will also delete the associated transaction.')) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
        if(window.dashboard) window.dashboard.showLoading();
        
        const batch = db.batch();
        const logRef = db.collection('grocery_logs').doc(id);
        batch.delete(logRef);

        // Find and delete associated transaction
        const txSnap = await db.collection('transactions')
            .where('userId', '==', user.uid)
            .where('relatedId', '==', id)
            .get();
        txSnap.forEach(doc => batch.delete(doc.ref));

        await batch.commit();
        
        await loadGroceryHistory();
        await calculateAndDisplayGroceryStats();
        if (window.dashboard) window.dashboard.showNotification('Purchase log deleted', 'success');
    } catch (e) {
        console.error(e);
        if (window.dashboard) window.dashboard.showNotification('Error deleting log', 'danger');
    } finally {
        if (window.dashboard) window.dashboard.hideLoading();
    }
};

window.editGroceryLog = async function(id) {
    try {
        const doc = await db.collection('grocery_logs').doc(id).get();
        if (!doc.exists) return;
        const data = doc.data();

        document.getElementById('edit-log-id').value = id;
        document.getElementById('edit-log-date').value = data.date;
        document.getElementById('edit-log-store').value = data.store || '';
        document.getElementById('edit-log-total').value = data.totalAmount;

        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('editGroceryLogModal'));
        modal.show();
    } catch (e) {
        console.error(e);
    }
};

window.saveGroceryLogEdit = async function() {
    const btn = document.getElementById('btn-save-log-edit');
    const id = document.getElementById('edit-log-id').value;
    const user = auth.currentUser;
    if (!user) return;
    const date = document.getElementById('edit-log-date').value;
    const store = document.getElementById('edit-log-store').value;
    const total = parseFloat(document.getElementById('edit-log-total').value) || 0;

    try {
        window.setBtnLoading(btn, true);
        
        const batch = db.batch();
        const logRef = db.collection('grocery_logs').doc(id);
        
        batch.update(logRef, {
            date, store, totalAmount: total,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Update transaction if exists
        const txSnap = await db.collection('transactions')
            .where('userId', '==', user.uid)
            .where('relatedId', '==', id)
            .get();
        txSnap.forEach(doc => {
            batch.update(doc.ref, {
                date: date,
                amount: total,
                description: `Grocery Run: ${store || 'Supermarket'}`,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });

        await batch.commit();
        
        bootstrap.Modal.getInstance(document.getElementById('editGroceryLogModal')).hide();
        await loadGroceryHistory();
        await calculateAndDisplayGroceryStats();
        
        window.setBtnLoading(btn, false);
        if (window.dashboard) window.dashboard.showNotification('Log updated', 'success');
    } catch (e) {
        window.setBtnLoading(btn, false);
        console.error(e);
        if (window.dashboard) window.dashboard.showNotification('Error updating log', 'danger');
    }
};

window.loadTopItems = async function() {
    const user = auth.currentUser;
    // Fetch logs (limit to last 50 for performance)
    const logsSnap = await db.collection('grocery_logs')
        .where('userId', '==', user.uid)
        .orderBy('date', 'desc')
        .limit(50)
        .get();

    const itemCounts = {};
    logsSnap.forEach(doc => {
        const data = doc.data();
        if (data.items && Array.isArray(data.items)) {
            data.items.forEach(item => {
                const name = item.name;
                if (name) {
                    itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 1);
                }
            });
        }
    });

    // Sort
    const sortedItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4); // Top 4

    const container = document.getElementById('top-items-container');
    const list = document.getElementById('top-items-list');
    
    if (sortedItems.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    list.innerHTML = sortedItems.map(([name, count]) => `
        <div class="col-6 col-md-3">
            <div class="p-3 bg-white border rounded shadow-sm text-center h-100">
                <div class="fw-bold text-truncate" title="${name}">${name}</div>
                <div class="small text-muted">${Math.round(count)} bought</div>
            </div>
        </div>
    `).join('');
};
