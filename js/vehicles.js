const FASTAG_PROVIDERS = [
  {"id":"PAYTM","name":"Paytm FASTag","logo":"logos/paytm.svg"},
  {"id":"PHONEPE","name":"PhonePe FASTag","logo":"logos/phonepe.svg"},
  {"id":"AIRTEL","name":"Airtel Payments Bank","logo":"logos/airtel.svg"},
  {"id":"SBI","name":"State Bank of India","logo":"logos/sbi.svg"},
  {"id":"ICICI","name":"ICICI Bank","logo":"logos/icici.svg"},
  {"id":"HDFC","name":"HDFC Bank","logo":"logos/hdfc.svg"},
  {"id":"AXIS","name":"Axis Bank","logo":"logos/axis.svg"},
  {"id":"IDFC","name":"IDFC First Bank","logo":"logos/idfc.svg"},
  {"id":"KOTAK","name":"Kotak Mahindra Bank","logo":"logos/kotak.svg"},
  {"id":"BOB","name":"Bank of Baroda","logo":"logos/bob.svg"},
  {"id":"PNB","name":"Punjab National Bank","logo":"logos/pnb.svg"},
  {"id":"CANARA","name":"Canara Bank","logo":"logos/canara.svg"},
  {"id":"UNION","name":"Union Bank of India","logo":"logos/union.svg"},
  {"id":"INDUSIND","name":"IndusInd Bank","logo":"logos/indusind.svg"},
  {"id":"YES","name":"Yes Bank","logo":"logos/yes.svg"},
  {"id":"FEDERAL","name":"Federal Bank","logo":"logos/federal.svg"},
  {"id":"CUB","name":"City Union Bank","logo":"logos/cub.svg"},
  {"id":"EQUITAS","name":"Equitas Small Finance Bank","logo":"logos/equitas.svg"},
  {"id":"FINO","name":"Fino Payments Bank","logo":"logos/fino.svg"},
  {"id":"BANDHAN","name":"Bandhan Bank","logo":"logos/bandhan.svg"},
  {"id":"AU","name":"AU Small Finance Bank","logo":"logos/au.svg"},
  {"id":"IOB","name":"Indian Overseas Bank","logo":"logos/iob.svg"},
  {"id":"UCO","name":"UCO Bank","logo":"logos/uco.svg"},
  {"id":"KVB","name":"Karur Vysya Bank","logo":"logos/kvb.svg"},
  {"id":"SOUTHINDIAN","name":"South Indian Bank","logo":"logos/sib.svg"},
  {"id":"CSB","name":"CSB Bank","logo":"logos/csb.svg"},
  {"id":"DBS","name":"DBS Bank India","logo":"logos/dbs.svg"}
];

const CAR_DATA = {
  "makers": [
    "Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Honda", "Toyota", "Ford", 
    "Volkswagen", "Skoda", "Renault", "Nissan", "Chevrolet", "Fiat", "Kia", 
    "MG", "Datsun", "Jeep", "Isuzu", "BMW", "Mercedes-Benz", "Audi"
  ],
  "models": {
    "Maruti Suzuki": [
      "800","Omni","Gypsy","Alto","Alto 800","Wagon R","Zen","Zen Estilo",
      "Swift","Swift Dzire","Baleno","Esteem","A-Star","Ritz","Ertiga",
      "Ciaz","S-Cross","Vitara Brezza","XL6","Ignis","Celerio","Fronx"
    ],
    "Hyundai": [
      "Santro","Santro Xing","i10","Grand i10","i20","Elite i20",
      "Accent","Verna","Elantra","Creta","Venue","Tucson","Xcent","Eon"
    ],
    "Tata": [
      "Indica","Indigo","Nano","Tiago","Tigor","Altroz","Nexon",
      "Harrier","Safari","Sumo","Bolt","Zest","Hexa","Manza"
    ],
    "Mahindra": [
      "Bolero","Scorpio","Scorpio Classic","XUV300","XUV500",
      "XUV700","Thar","Quanto","Verito","Logan","TUV300","Marazzo"
    ],
    "Honda": [
      "City","Amaze","Jazz","Brio","Accord","Civic","WR-V","CR-V"
    ],
    "Toyota": [
      "Innova","Innova Crysta","Fortuner","Corolla","Camry",
      "Glanza","Urban Cruiser","Yaris","Etios","Liva"
    ],
    "Ford": [
      "Ikon","Fiesta","Figo","Aspire","EcoSport","Endeavour"
    ],
    "Volkswagen": [
      "Polo","Vento","Virtus","Taigun","Jetta","Passat"
    ],
    "Skoda": [
      "Octavia","Rapid","Superb","Kushaq","Slavia","Fabia"
    ],
    "Renault": [
      "Kwid","Duster","Triber","Lodgy","Pulse","Scala"
    ],
    "Nissan": [
      "Micra","Sunny","Terrano","Kicks","Teana"
    ],
    "Chevrolet": [
      "Spark","Beat","Sail","Cruze","Tavera","Enjoy"
    ],
    "Fiat": [
      "Punto","Linea","Palio","Avventura","Uno"
    ],
    "Kia": [
      "Seltos","Sonet","Carens","Carnival","EV6"
    ],
    "MG": [
      "Hector","Astor","ZS EV","Gloster","Comet"
    ],
    "Datsun": [
      "Go","Go Plus","Redi-Go"
    ],
    "Jeep": [
      "Compass","Meridian","Wrangler","Grand Cherokee"
    ],
    "Isuzu": [
      "D-Max","V-Cross","MU-X"
    ],
    "BMW": [
      "3 Series","5 Series","7 Series","X1","X3","X5"
    ],
    "Mercedes-Benz": [
      "C-Class","E-Class","S-Class","GLA","GLC","GLE"
    ],
    "Audi": [
      "A3","A4","A6","Q3","Q5","Q7"
    ]
  }
};

const BIKE_DATA = [
  {
    "maker":"Hero",
    "models":[
      {"name":"Splendor","from":2005,"to":2026},
      {"name":"HF Deluxe","from":2005,"to":2026},
      {"name":"Passion","from":2005,"to":2026}
    ]
  },
  {
    "maker":"Honda",
    "models":[
      {"name":"Shine","from":2006,"to":2026},
      {"name":"Unicorn","from":2005,"to":2026},
      {"name":"Activa","from":2005,"to":2026}
    ]
  },
  {
    "maker":"Bajaj",
    "models":[
      {"name":"Pulsar","from":2005,"to":2026},
      {"name":"Discover","from":2005,"to":2020},
      {"name":"Dominar","from":2016,"to":2026}
    ]
  },
  {
    "maker":"TVS",
    "models":[
      {"name":"Apache","from":2006,"to":2026},
      {"name":"Jupiter","from":2013,"to":2026},
      {"name":"XL100","from":2005,"to":2026}
    ]
  },
  {
    "maker":"Royal Enfield",
    "models":[
      {"name":"Classic 350","from":2009,"to":2026},
      {"name":"Bullet","from":2005,"to":2026},
      {"name":"Himalayan","from":2016,"to":2026}
    ]
  }
];

window.loadVehiclesSection = async function() {
    const container = document.getElementById('vehicles-section');
    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold gradient-text mb-0">Vehicle Tracker</h2>
            <button class="btn btn-primary" onclick="showAddVehicleModal()">
                <i class="fas fa-plus me-2"></i>Add Vehicle
            </button>
        </div>

        <!-- Global Stats -->
        <div class="row g-4 mb-4" id="vehicle-global-stats">
            <div class="col-12 text-center"><div class="spinner-border text-primary"></div></div>
        </div>

        <!-- Vehicles List (Single View) -->
        <div id="vehicles-container" class="row g-4">
            <!-- Vehicle Cards go here -->
        </div>

        <!-- Add Vehicle Modal -->
        <div class="modal fade" id="addVehicleModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add Vehicle</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="vehicle-form">
                            <input type="hidden" id="vehicle-id">
                            <div class="mb-3">
                                <label class="form-label">Vehicle Name</label>
                                <input type="text" class="form-control" id="vehicle-name" placeholder="e.g. My Daily Driver" required>
                            </div>
                            <div class="row">
                                <div class="col-6 mb-3">
                                    <label class="form-label">Type</label>
                                    <select class="form-select" id="vehicle-type" onchange="populateVehicleMakes()">
                                        <option value="Car">Car</option>
                                        <option value="Bike">Bike</option>
                                        <option value="Scooter">Scooter</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div class="col-6 mb-3">
                                    <label class="form-label">Year</label>
                                    <select class="form-select" id="vehicle-year">
                                        <!-- Populated by JS -->
                                    </select>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-6 mb-3">
                                    <label class="form-label">Reg. Number</label>
                                    <input type="text" class="form-control" id="vehicle-reg">
                                </div>
                                <div class="col-6 mb-3">
                                    <label class="form-label">RC Expiry</label>
                                    <input type="date" class="form-control" id="vehicle-rc-expiry">
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-6 mb-3">
                                    <label class="form-label">Make</label>
                                    <select class="form-select" id="vehicle-make" onchange="populateVehicleModels()">
                                        <option value="">Select Make</option>
                                    </select>
                                </div>
                                <div class="col-6 mb-3">
                                    <label class="form-label">Model</label>
                                    <select class="form-select" id="vehicle-model">
                                        <option value="">Select Model</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Current Odometer (km)</label>
                                <input type="number" class="form-control" id="vehicle-odometer" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">FASTag Provider</label>
                                <select class="form-select" id="vehicle-fastag-provider" onchange="toggleFastagBalanceField()">
                                    <option value="">None</option>
                                    ${FASTAG_PROVIDERS.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                                </select>
                            </div>
                            <div id="div-fastag-balance" style="display:none;">
                                <div class="row mb-3">
                                    <div class="col-6">
                                        <label class="form-label">Current Balance (₹)</label>
                                        <input type="number" class="form-control" id="vehicle-fastag-balance" step="0.01" placeholder="0.00">
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label">Low Alert Limit (₹)</label>
                                        <input type="number" class="form-control" id="vehicle-fastag-threshold" step="1" placeholder="e.g. 200">
                                    </div>
                                </div>
                            </div>
                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" id="vehicle-primary">
                                <label class="form-check-label" for="vehicle-primary">Set as Primary Vehicle</label>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="btn-save-vehicle" onclick="saveVehicle()">Save Vehicle</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Log Modal -->
        <div class="modal fade" id="addVehicleLogModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add Vehicle Log</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="vehicle-log-form">
                            <input type="hidden" id="log-id">
                            <div class="mb-3">
                                <label class="form-label">Vehicle</label>
                                <select class="form-select" id="log-vehicle" required onchange="updateLogOdometerPlaceholder()">
                                    <!-- Populated dynamically -->
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Log Type</label>
                                <select class="form-select" id="log-type" onchange="toggleLogFields()">
                                    <option value="fuel">Fuel</option>
                                    <option value="service">Service / Maintenance</option>
                                    <option value="repair">Repair</option>
                                    <option value="insurance">Insurance</option>
                                    <option value="toll">FASTag Toll</option>
                                    <option value="expense">Other Expense</option>
                                </select>
                            </div>
                            
                            <div class="row">
                                <div class="col-6 mb-3">
                                    <label class="form-label">Date</label>
                                    <input type="date" class="form-control" id="log-date" required>
                                </div>
                                <div class="col-6 mb-3">
                                    <label class="form-label">Odometer (km)</label>
                                    <input type="number" class="form-control" id="log-odometer" required>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Total Cost (₹)</label>
                                <input type="number" class="form-control" id="log-cost" step="0.01" required>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Payment Mode</label>
                                <select class="form-select" id="log-payment-mode">
                                    <option value="cash">Cash</option>
                                    <option value="fastag_wallet">FASTag Wallet</option>
                                    <option value="upi" selected>UPI</option>
                                    <option value="card">Card</option>
                                    <option value="bank">Bank Transfer</option>
                                </select>
                            </div>

                            <!-- Fuel Specific Fields -->
                            <div id="fuel-fields">
                                <div class="row">
                                    <div class="col-6 mb-3">
                                        <label class="form-label">Fuel Price / L</label>
                                        <input type="number" class="form-control" id="log-price-unit" step="0.01" onchange="calculateFuelQty()">
                                    </div>
                                    <div class="col-6 mb-3">
                                        <label class="form-label">Quantity (L)</label>
                                        <input type="number" class="form-control" id="log-quantity" step="0.01">
                                    </div>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="log-full-tank" checked>
                                    <label class="form-check-label" for="log-full-tank">Full Tank (for accurate mileage)</label>
                                </div>
                            </div>

                            <!-- Service Specific Fields -->
                            <div id="service-fields" class="d-none">
                                <div class="mb-3">
                                    <label class="form-label">Service Type</label>
                                    <select class="form-select" id="log-service-type">
                                        <option value="General Service">General Service</option>
                                        <option value="Oil Change">Oil Change</option>
                                        <option value="Wheel Alignment">Wheel Alignment</option>
                                        <option value="Tyre Change">Tyre Change</option>
                                        <option value="Battery">Battery</option>
                                        <option value="Wash">Car Wash/Detailing</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Notes / Description</label>
                                <textarea class="form-control" id="log-notes" rows="2"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="btn-save-vehicle-log" onclick="saveVehicleLog()">Save Log</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Service Alert Modal -->
        <div class="modal fade" id="addServiceAlertModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Set Service Alert</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="service-alert-form">
                            <input type="hidden" id="alert-id">
                            <div class="mb-3">
                                <label class="form-label">Vehicle</label>
                                <select class="form-select" id="alert-vehicle" required onchange="updateAlertOdometerHelper()">
                                    <!-- Populated dynamically -->
                                </select>
                                <div class="form-text" id="alert-current-odo-text"></div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Service Name</label>
                                <input type="text" class="form-control" id="alert-title" placeholder="e.g. Wheel Alignment, Oil Change" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Due at Odometer (km)</label>
                                <input type="number" class="form-control" id="alert-due-odometer" required>
                                <div class="form-text">Enter the odometer reading when service is due.</div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="btn-save-service-alert" onclick="saveServiceAlert()">Save Alert</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Update Odometer Modal -->
        <div class="modal fade" id="updateOdometerModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-sm">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title fs-6">Update Odometer</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="update-odo-vehicle-id">
                        <div class="mb-2">
                            <label class="form-label small">New Reading (km)</label>
                            <input type="number" class="form-control" id="update-odo-value" required>
                        </div>
                        <button type="button" class="btn btn-primary w-100 btn-sm" onclick="saveOdometerUpdate()">Update</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Vehicle Docs Modal -->
        <div class="modal fade" id="vehicleDocsModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Vehicle Documents</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="docs-vehicle-id">
                        <div id="vehicle-docs-list" class="mb-4 list-group">
                            <!-- List of docs -->
                        </div>
                        
                        <div class="bg-light p-3 rounded border">
                            <h6 class="mb-3 small fw-bold text-uppercase text-muted">Add / Update Document</h6>
                            <form id="vehicle-doc-form">
                                <div class="row g-2">
                                    <div class="col-6 mb-2">
                                        <label class="form-label small">Type</label>
                                        <select class="form-select form-select-sm" id="doc-type">
                                            <option value="RC">RC (Registration)</option>
                                            <option value="Insurance">Insurance</option>
                                            <option value="PUC">PUC (Pollution)</option>
                                            <option value="Permit">Permit</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div class="col-6 mb-2">
                                        <label class="form-label small">Doc Number</label>
                                        <input type="text" class="form-control form-control-sm" id="doc-number" placeholder="Optional">
                                    </div>
                                    <div class="col-12 mb-2">
                                        <label class="form-label small">Expiry Date</label>
                                        <input type="date" class="form-control form-control-sm" id="doc-expiry" required>
                                    </div>
                                </div>
                                <button type="button" class="btn btn-sm btn-primary w-100 mt-2" onclick="saveVehicleDoc()">
                                    <i class="fas fa-save me-1"></i> Save Document
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- FASTag Recharge Modal -->
        <div class="modal fade" id="fastagRechargeModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-sm">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title fs-6">Recharge FASTag</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="recharge-vehicle-id">
                        <div class="mb-3">
                            <label class="form-label small">Amount (₹)</label>
                            <input type="number" class="form-control" id="recharge-amount" step="1" min="1" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label small">Date</label>
                            <input type="date" class="form-control" id="recharge-date" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label small">Payment Source</label>
                            <select class="form-select form-select-sm" id="recharge-payment-mode">
                                <option value="upi">UPI</option>
                                <option value="bank">Net Banking</option>
                                <option value="card">Credit/Debit Card</option>
                                <option value="wallet">Wallet</option>
                            </select>
                        </div>
                        <button type="button" class="btn btn-success w-100 btn-sm" onclick="saveFastagRecharge()">
                            <i class="fas fa-bolt me-1"></i> Recharge
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    await loadVehicleDashboard();
};

window.loadVehicleDashboard = async function() {
    const user = auth.currentUser;
    const container = document.getElementById('vehicles-container');
    const statsContainer = document.getElementById('vehicle-global-stats');
    
    // 1. Fetch Vehicles
    const vehiclesSnap = await db.collection('vehicles').where('userId', '==', user.uid).get();
    
    if (vehiclesSnap.empty) {
        statsContainer.innerHTML = '';
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="mb-3"><i class="fas fa-car fa-3x text-muted"></i></div>
                <h5 class="text-muted">No vehicles added yet</h5>
                <p class="text-muted small">Add a vehicle to start tracking mileage and expenses.</p>
                <button class="btn btn-primary mt-2" onclick="showAddVehicleModal()">Add Vehicle</button>
            </div>`;
        return;
    }

    // 2. Fetch All Logs & Alerts
    const logsSnap = await db.collection('vehicle_logs')
        .where('userId', '==', user.uid)
        .orderBy('date', 'desc')
        .get();
        
    const alertsSnap = await db.collection('service_alerts')
        .where('userId', '==', user.uid)
        .get();

    // Process Data
    const vehicles = [];
    vehiclesSnap.forEach(doc => {
        vehicles.push({ id: doc.id, ...doc.data() });
    });

    // Sort: Primary first
    vehicles.sort((a, b) => {
        if (!!a.isPrimary === !!b.isPrimary) return 0;
        return a.isPrimary ? -1 : 1;
    });

    const logsByVehicle = {};
    let totalCost = 0;
    let totalFuelCost = 0;
    let totalFastagCost = 0;
    
    logsSnap.forEach(doc => {
        const log = doc.data();
        log.id = doc.id;
        if (!logsByVehicle[log.vehicleId]) logsByVehicle[log.vehicleId] = [];
        logsByVehicle[log.vehicleId].push(log);
        
        // Calculate Total Running Cost (Consumption)
        // Exclude 'fastag_recharge' from running cost as it's a fund transfer. Include 'toll'.
        if (log.type !== 'fastag_recharge') totalCost += (log.cost || 0);
        
        if (log.type === 'fuel') totalFuelCost += (log.cost || 0);
        if (log.type === 'toll') totalFastagCost += (log.cost || 0); // Track actual toll usage
    });

    const alertsByVehicle = {};
    alertsSnap.forEach(doc => {
        const alert = doc.data();
        alert.id = doc.id;
        if (!alertsByVehicle[alert.vehicleId]) alertsByVehicle[alert.vehicleId] = [];
        alertsByVehicle[alert.vehicleId].push(alert);
    });

    // Render Global Stats
    statsContainer.innerHTML = `
        <div class="col-6 col-md-3">
            <div class="p-3 bg-white rounded-4 shadow-sm border-start border-4 border-primary h-100">
                <div class="text-muted small fw-bold text-uppercase">Total Spent</div>
                <h4 class="mb-0 text-primary">₹${totalCost.toFixed(0)}</h4>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="p-3 bg-white rounded-4 shadow-sm border-start border-4 border-warning h-100">
                <div class="text-muted small fw-bold text-uppercase">Fuel Cost</div>
                <h4 class="mb-0 text-warning">₹${totalFuelCost.toFixed(0)}</h4>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="p-3 bg-white rounded-4 shadow-sm border-start border-4 border-secondary h-100" style="border-color: #6610f2 !important;">
                <div class="text-muted small fw-bold text-uppercase">Toll Usage</div>
                <h4 class="mb-0" style="color: #6610f2;">₹${totalFastagCost.toFixed(0)}</h4>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="p-3 bg-white rounded-4 shadow-sm border-start border-4 border-info h-100">
                <div class="text-muted small fw-bold text-uppercase">Vehicles</div>
                <h4 class="mb-0 text-info">${vehicles.length}</h4>
            </div>
        </div>
    `;

    // Render Vehicle Cards
    container.innerHTML = '';
    const chartsToRender = [];

    vehicles.forEach(v => {
        const vLogs = logsByVehicle[v.id] || [];
        const vAlerts = alertsByVehicle[v.id] || [];
        
        // Document Status Logic
        const docs = v.documents || [];
        let docStatusHtml = '';
        let hasDocs = false;
        let docsContent = '';

        // 1. Check RC Expiry (Root Field)
        if (v.rcExpiry) {
            hasDocs = true;
            const today = new Date();
            today.setHours(0,0,0,0);
            const expiryDate = new Date(v.rcExpiry);
            const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            
            let badgeClass = 'bg-success-subtle text-success border-success-subtle';
            let icon = 'fa-check-circle';
            let statusText = `${daysLeft} days left`;
            
            if (daysLeft < 0) {
                badgeClass = 'bg-danger-subtle text-danger border-danger-subtle';
                icon = 'fa-exclamation-circle';
                statusText = `Expired ${Math.abs(daysLeft)} days ago`;
            } else if (daysLeft <= 30) {
                badgeClass = 'bg-warning-subtle text-warning-emphasis border-warning-subtle';
                icon = 'fa-exclamation-triangle';
                statusText = `${daysLeft} days left`;
            }

            docsContent += `
                <div class="border ${badgeClass} rounded px-2 py-1 d-flex align-items-center" style="font-size: 0.75rem;">
                    <i class="fas ${icon} me-2"></i>
                    <div>
                        <div class="fw-bold">RC Expiry</div>
                        <div class="small" style="font-size: 0.65rem; opacity: 0.85;">${statusText}</div>
                    </div>
                </div>
            `;
        }

        // 2. Check Other Documents
        if (docs.length > 0) {
            hasDocs = true;
            docs.forEach(d => {
                if (!d.expiry) return;
                const today = new Date();
                today.setHours(0,0,0,0);
                const expiryDate = new Date(d.expiry);
                const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                
                let badgeClass = 'bg-success-subtle text-success border-success-subtle';
                let icon = 'fa-check-circle';
                let statusText = `${daysLeft} days left`;
                
                if (daysLeft < 0) {
                    badgeClass = 'bg-danger-subtle text-danger border-danger-subtle';
                    icon = 'fa-exclamation-circle';
                    statusText = `Expired ${Math.abs(daysLeft)} days ago`;
                } else if (daysLeft <= 30) {
                    badgeClass = 'bg-warning-subtle text-warning-emphasis border-warning-subtle';
                    icon = 'fa-exclamation-triangle';
                    statusText = `${daysLeft} days left`;
                }

                docsContent += `
                    <div class="border ${badgeClass} rounded px-2 py-1 d-flex align-items-center" style="font-size: 0.75rem;">
                        <i class="fas ${icon} me-2"></i>
                        <div>
                            <div class="fw-bold">${d.type}</div>
                            <div class="small" style="font-size: 0.65rem; opacity: 0.85;">${statusText}</div>
                        </div>
                    </div>
                `;
            });
        }

        if (hasDocs) {
            docStatusHtml = `<div class="d-flex flex-wrap gap-2">${docsContent}</div>`;
        }

        // Calculate Mileage Stats
        const fuelLogs = vLogs.filter(l => l.type === 'fuel' && l.mileage > 0);
        const lastMileage = fuelLogs.length > 0 ? fuelLogs[0].mileage : 0;
        const avgMileage = v.averageMileage || 0;
        
        // Prepare Chart Data
        let chartHtml = '';
        const chartLogs = [...fuelLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (chartLogs.length >= 2) {
            const recentChartLogs = chartLogs.slice(-10); // Last 10 entries
            chartHtml = `
                <div class="mb-4">
                    <div class="d-flex justify-content-between align-items-end mb-2">
                        <span class="small text-muted fw-bold text-uppercase">Efficiency Trend</span>
                        <span class="badge bg-light text-dark border">Last ${recentChartLogs.length} fills</span>
                    </div>
                    <div style="height: 120px; width: 100%;">
                        <canvas id="chart-${v.id}"></canvas>
                    </div>
                </div>
            `;
            chartsToRender.push({
                id: `chart-${v.id}`,
                labels: recentChartLogs.map(l => new Date(l.date).toLocaleDateString('en-US', {month:'short', day:'numeric'})),
                data: recentChartLogs.map(l => l.mileage)
            });
        }
        
        const primaryBadge = v.isPrimary ? '<span class="badge bg-primary ms-2" style="font-size: 0.7em;">PRIMARY</span>' : '';

        // Alerts Status
        let alertHtml = '';
        vAlerts.forEach(a => {
            const remaining = a.dueOdometer - v.currentOdometer;
            let badgeClass = 'bg-success';
            if (remaining < 0) badgeClass = 'bg-danger';
            else if (remaining < 500) badgeClass = 'bg-warning text-dark';
            
            alertHtml += `
                <div class="d-flex justify-content-between align-items-center small mb-1 p-2 bg-light rounded">
                    <div class="d-flex align-items-center text-truncate">
                        <i class="fas fa-bell text-warning me-2"></i>
                        <span class="text-truncate">${a.title}</span>
                    </div>
                    <div class="d-flex align-items-center flex-shrink-0">
                        <span class="badge ${badgeClass} me-2">${remaining} km</span>
                        <button class="btn btn-link text-muted p-0 me-2" onclick="editServiceAlert('${a.id}')" title="Edit"><i class="fas fa-edit" style="font-size: 0.8rem;"></i></button>
                        <button class="btn btn-link text-danger p-0" onclick="deleteServiceAlert('${a.id}')" title="Delete"><i class="fas fa-trash" style="font-size: 0.8rem;"></i></button>
                    </div>
                </div>
            `;
        });

        // FASTag Low Balance Alert
        if (v.fastagProvider && v.fastagThreshold > 0 && (v.fastagBalance || 0) < v.fastagThreshold) {
            alertHtml += `
                <div class="d-flex justify-content-between align-items-center small mb-1 p-2 bg-danger bg-opacity-10 rounded text-danger">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-wallet me-2"></i>
                        <span>Low FASTag Balance</span>
                    </div>
                    <div class="fw-bold">₹${(v.fastagBalance || 0).toFixed(0)} <span class="small opacity-75">/ ₹${v.fastagThreshold}</span></div>
                </div>
            `;
        }

        // FASTag Widget
        let fastagHtml = '';
        if (v.fastagProvider) {
            const provider = FASTAG_PROVIDERS.find(p => p.id === v.fastagProvider) || { name: v.fastagProvider };
            fastagHtml = `
                <div class="p-2 bg-white border rounded mb-3 d-flex justify-content-between align-items-center shadow-sm">
                    <div class="d-flex align-items-center overflow-hidden">
                        <div class="me-2 text-primary"><i class="fas fa-tag"></i></div>
                        <div class="text-truncate">
                            <div class="small text-muted text-truncate" style="font-size: 0.65rem;">${provider.name}</div>
                            <div class="fw-bold text-dark">₹${(v.fastagBalance || 0).toFixed(2)}</div>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline-success ms-2" style="font-size: 0.7rem;" onclick="showFastagRechargeModal('${v.id}')">Recharge</button>
                </div>
            `;
        }

        // Recent Logs HTML
        const recentLogs = vLogs.slice(0, 3).map(l => {
            let icon = 'fa-gas-pump';
            let color = 'text-warning';
            if (l.type === 'service') { icon = 'fa-tools'; color = 'text-info'; }
            else if (l.type === 'repair') { icon = 'fa-wrench'; color = 'text-danger'; }
            else if (l.type === 'toll') { icon = 'fa-road'; color = 'text-secondary'; }
            
            return `
                <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                    <div class="d-flex align-items-center">
                        <div class="me-3 ${color}" style="width: 20px;"><i class="fas ${icon}"></i></div>
                        <div>
                            <div class="small fw-bold">${new Date(l.date).toLocaleDateString()}</div>
                            <div class="small text-muted" style="font-size: 0.75rem;">${l.odometer} km</div>
                        </div>
                    </div>
                    <div class="text-end">
                        <div class="small fw-bold">₹${l.cost}</div>
                        ${l.mileage ? `<div class="small text-success" style="font-size: 0.75rem;">${l.mileage.toFixed(1)} km/l</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        const card = document.createElement('div');
        card.className = 'col-md-6 col-xl-4';
        card.innerHTML = `
            <div class="card h-100 border-0 shadow-sm rounded-4">
                <div class="card-header bg-transparent border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-start">
                    <div class="d-flex align-items-center">
                        <div class="bg-primary bg-opacity-10 text-primary rounded-circle p-3 me-3">
                            <i class="fas ${v.type === 'Bike' || v.type === 'Scooter' ? 'fa-motorcycle' : 'fa-car'} fa-lg"></i>
                        </div>
                        <div>
                            <h5 class="mb-0 fw-bold">${v.name}${primaryBadge}</h5>
                            <small class="text-muted">${v.year || ''} ${v.make || ''} ${v.model || ''} • ${v.regNumber || ''}</small>
                        </div>
                    </div>
                    <div class="dropdown">
                        <button class="btn btn-link text-muted p-0" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-v"></i></button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="javascript:void(0)" onclick="editVehicle('${v.id}')">Edit Vehicle</a></li>
                            <li><a class="dropdown-item" href="javascript:void(0)" onclick="showAddServiceAlertModal('${v.id}')">Set Alert</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="deleteVehicle('${v.id}')">Delete</a></li>
                        </ul>
                    </div>
                </div>
                <div class="card-body px-4">
                    <div class="row g-2 mb-4 mt-2">
                        <div class="col-6">
                            <div class="p-2 bg-light rounded-3 text-center position-relative">
                                <div class="small text-muted mb-1">Odometer</div>
                                <div class="fw-bold">${v.currentOdometer} km</div>
                                <button class="btn btn-link btn-sm p-0 position-absolute top-0 end-0 me-2 mt-1 text-muted opacity-50" onclick="showUpdateOdometerModal('${v.id}', ${v.currentOdometer})" title="Update Odometer">
                                    <i class="fas fa-pen" style="font-size: 0.6rem;"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="p-2 bg-success bg-opacity-10 rounded-3 text-center">
                                <div class="small text-success mb-1">Avg. Mileage</div>
                                <div class="fw-bold text-success">${avgMileage ? avgMileage.toFixed(1) + ' km/l' : '--'}</div>
                            </div>
                        </div>
                    </div>

                    ${lastMileage > 0 ? `
                    <div class="mb-3">
                        <div class="d-flex justify-content-between small mb-1">
                            <span class="text-muted">Last Mileage</span>
                            <span class="fw-bold ${lastMileage >= avgMileage ? 'text-success' : 'text-warning'}">${lastMileage.toFixed(1)} km/l</span>
                        </div>
                        <div class="progress" style="height: 6px;">
                            <div class="progress-bar ${lastMileage >= avgMileage ? 'bg-success' : 'bg-warning'}" 
                                 role="progressbar" style="width: ${Math.min(100, (lastMileage / (avgMileage * 1.5)) * 100)}%"></div>
                        </div>
                    </div>` : ''}

                    ${alertHtml ? `<div class="mb-3">${alertHtml}</div>` : ''}
                    ${docStatusHtml ? `<div class="mb-3">${docStatusHtml}</div>` : ''}
                    ${fastagHtml}

                    ${chartHtml}

                    <div class="d-grid gap-2 d-flex mb-3">
                        <button class="btn btn-primary flex-grow-1" onclick="showAddVehicleLogModal('${v.id}', 'fuel')" title="Add Fuel Log">
                            <i class="fas fa-gas-pump me-2"></i>Fuel
                        </button>
                        <button class="btn btn-outline-secondary flex-grow-1" onclick="showVehicleDocsModal('${v.id}')" title="Manage Documents">
                            <i class="fas fa-file-alt me-2"></i>Docs
                        </button>
                        <button class="btn btn-outline-secondary flex-grow-1" onclick="showAddVehicleLogModal('${v.id}', 'service')" title="Add Service Log">
                            <i class="fas fa-tools me-2"></i>Service
                        </button>
                    </div>

                    ${recentLogs ? `
                    <div class="mt-3">
                        <div class="small text-muted fw-bold mb-2 text-uppercase">Recent Activity</div>
                        ${recentLogs}
                    </div>` : ''}
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    // Render Charts
    chartsToRender.forEach(config => {
        const ctx = document.getElementById(config.id);
        if (ctx && typeof Chart !== 'undefined') {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: config.labels,
                    datasets: [{
                        label: 'Mileage (km/l)',
                        data: config.data,
                        borderColor: '#198754',
                        backgroundColor: 'rgba(25, 135, 84, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 3,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#198754'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { display: true, grid: { display: false }, ticks: { font: { size: 9 } } },
                        y: { display: true, ticks: { font: { size: 9 } } }
                    }
                }
            });
        }
    });
};

window.showAddVehicleModal = function() {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addVehicleModal'));
    document.getElementById('vehicle-form').reset();
    document.getElementById('vehicle-id').value = '';
    document.getElementById('vehicle-primary').checked = false;
    toggleFastagBalanceField();
    populateVehicleMakes(); // Initialize dropdowns
    populateVehicleYears();
    modal.show();
};

window.populateLogVehicleSelect = async function() {
    const user = auth.currentUser;
    const snapshot = await db.collection('vehicles').where('userId', '==', user.uid).get();
    const select = document.getElementById('log-vehicle');
    select.innerHTML = '';
    
    if (snapshot.empty) return false;

    snapshot.forEach(doc => {
        const v = doc.data();
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = v.name;
        if (v.isPrimary) option.selected = true;
        option.dataset.odometer = v.currentOdometer || 0;
        select.appendChild(option);
    });
    return true;
};

window.showAddVehicleLogModal = async function(vehicleId = null, type = 'fuel') {
    const hasVehicles = await populateLogVehicleSelect();
    
    if (!hasVehicles) {
        if(window.dashboard) window.dashboard.showNotification('Please add a vehicle first.', 'warning');
        showAddVehicleModal();
        return;
    }

    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addVehicleLogModal'));
    document.getElementById('vehicle-log-form').reset();
    document.getElementById('log-id').value = '';
    document.getElementById('log-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('log-type').value = type;
    
    if (vehicleId) {
        document.getElementById('log-vehicle').value = vehicleId;
    }
    
    toggleLogFields();
    updateLogOdometerPlaceholder();
    modal.show();
};

window.showAddServiceAlertModal = async function(vehicleId = null) {
    const user = auth.currentUser;
    const snapshot = await db.collection('vehicles').where('userId', '==', user.uid).get();
    
    if (snapshot.empty) {
        if(window.dashboard) window.dashboard.showNotification('Please add a vehicle first.', 'warning');
        return;
    }

    const select = document.getElementById('alert-vehicle');
    select.innerHTML = '';
    snapshot.forEach(doc => {
        const v = doc.data();
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = v.name;
        option.dataset.odometer = v.currentOdometer || 0;
        select.appendChild(option);
    });

    if (vehicleId) {
        select.value = vehicleId;
    }

    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addServiceAlertModal'));
    document.getElementById('alert-id').value = '';
    document.getElementById('service-alert-form').reset();
    updateAlertOdometerHelper();
    modal.show();
};

window.showVehicleDocsModal = async function(vehicleId) {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('vehicleDocsModal'));
    document.getElementById('docs-vehicle-id').value = vehicleId;
    document.getElementById('vehicle-doc-form').reset();
    
    const listContainer = document.getElementById('vehicle-docs-list');
    listContainer.innerHTML = '<div class="text-center"><div class="spinner-border spinner-border-sm text-primary"></div></div>';
    
    try {
        const doc = await db.collection('vehicles').doc(vehicleId).get();
        if (!doc.exists) return;
        
        const v = doc.data();
        const docs = v.documents || [];
        
        listContainer.innerHTML = '';
        if (docs.length === 0) {
            listContainer.innerHTML = '<div class="text-center text-muted small py-2">No documents added yet.</div>';
        } else {
            docs.forEach((d, index) => {
                const daysLeft = Math.ceil((new Date(d.expiry) - new Date()) / (1000 * 60 * 60 * 24));
                let badgeClass = 'bg-success';
                let statusText = 'Valid';
                
                if (daysLeft < 0) { badgeClass = 'bg-danger'; statusText = 'Expired'; }
                else if (daysLeft < 30) { badgeClass = 'bg-warning text-dark'; statusText = 'Expiring Soon'; }
                
                const item = document.createElement('div');
                item.className = 'list-group-item d-flex justify-content-between align-items-center p-2';
                item.innerHTML = `
                    <div>
                        <div class="fw-bold small">${d.type} <span class="badge ${badgeClass} ms-1" style="font-size: 0.6rem;">${statusText}</span></div>
                        <div class="small text-muted">
                            ${d.number ? `<span class="me-2"><i class="fas fa-hashtag me-1"></i>${d.number}</span>` : ''}
                            <span><i class="fas fa-calendar me-1"></i>${new Date(d.expiry).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline-danger border-0" onclick="deleteVehicleDoc('${vehicleId}', ${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                listContainer.appendChild(item);
            });
        }
    } catch (e) {
        console.error(e);
        listContainer.innerHTML = '<div class="text-danger small">Error loading documents</div>';
    }
    
    modal.show();
};

window.saveVehicleDoc = async function() {
    const vehicleId = document.getElementById('docs-vehicle-id').value;
    const type = document.getElementById('doc-type').value;
    const number = document.getElementById('doc-number').value;
    const expiry = document.getElementById('doc-expiry').value;
    
    if (!expiry) {
        if(window.dashboard) window.dashboard.showNotification('Expiry date is required', 'warning');
        return;
    }
    
    try {
        const docRef = db.collection('vehicles').doc(vehicleId);
        const newDoc = { type, number, expiry };
        
        await docRef.update({
            documents: firebase.firestore.FieldValue.arrayUnion(newDoc)
        });
        
        showVehicleDocsModal(vehicleId); // Refresh list
        loadVehicleDashboard(); // Refresh dashboard badges
        if(window.dashboard) window.dashboard.showNotification('Document saved', 'success');
    } catch (e) {
        console.error(e);
        if(window.dashboard) window.dashboard.showNotification('Error saving document', 'danger');
    }
};

window.deleteVehicleDoc = async function(vehicleId, index) {
    if (!confirm('Delete this document?')) return;
    
    try {
        const docRef = db.collection('vehicles').doc(vehicleId);
        const docSnap = await docRef.get();
        if (!docSnap.exists) return;
        
        const docs = docSnap.data().documents || [];
        if (index >= 0 && index < docs.length) {
            docs.splice(index, 1); // Remove item at index
            await docRef.update({ documents: docs });
            
            showVehicleDocsModal(vehicleId);
            loadVehicleDashboard();
            if(window.dashboard) window.dashboard.showNotification('Document deleted', 'success');
        }
    } catch (e) {
        console.error(e);
    }
};

window.toggleLogFields = function() {
    const type = document.getElementById('log-type').value;
    const fuelFields = document.getElementById('fuel-fields');
    const serviceFields = document.getElementById('service-fields');
    
    if (type === 'fuel') {
        fuelFields.classList.remove('d-none');
        serviceFields.classList.add('d-none');
    } else if (type === 'service' || type === 'repair') {
        fuelFields.classList.add('d-none');
        serviceFields.classList.remove('d-none');
    } else {
        fuelFields.classList.add('d-none');
        serviceFields.classList.add('d-none');
    }

    // Auto-select FASTag Wallet for Tolls
    const paymentSelect = document.getElementById('log-payment-mode');
    if (type === 'toll') {
        paymentSelect.value = 'fastag_wallet';
    } else if (paymentSelect.value === 'fastag_wallet') {
        paymentSelect.value = 'upi'; // Reset if changing away from toll
    }
};

window.updateLogOdometerPlaceholder = function() {
    const select = document.getElementById('log-vehicle');
    const option = select.options[select.selectedIndex];
    if (option) {
        const currentOdo = option.dataset.odometer;
        document.getElementById('log-odometer').value = currentOdo;
        document.getElementById('log-odometer').min = currentOdo;
    }
};

window.updateAlertOdometerHelper = function() {
    const select = document.getElementById('alert-vehicle');
    const option = select.options[select.selectedIndex];
    if (option) {
        document.getElementById('alert-current-odo-text').textContent = `Current Odometer: ${option.dataset.odometer} km`;
    }
};

window.calculateFuelQty = function() {
    const cost = parseFloat(document.getElementById('log-cost').value);
    const price = parseFloat(document.getElementById('log-price-unit').value);
    if (cost && price) {
        document.getElementById('log-quantity').value = (cost / price).toFixed(2);
    }
};

window.toggleFastagBalanceField = function() {
    const provider = document.getElementById('vehicle-fastag-provider').value;
    const div = document.getElementById('div-fastag-balance');
    div.style.display = provider ? 'block' : 'none';
};

window.populateVehicleYears = function() {
    const yearSelect = document.getElementById('vehicle-year');
    yearSelect.innerHTML = '<option value="">Year</option>';
    const years = Array.from({ length: 2026 - 2005 + 1 }, (_, i) => 2005 + i);
    years.reverse().forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });
};

window.populateVehicleMakes = function(selectedMake = null) {
    const type = document.getElementById('vehicle-type').value;
    const makeSelect = document.getElementById('vehicle-make');
    const modelSelect = document.getElementById('vehicle-model');
    
    makeSelect.innerHTML = '<option value="">Select Make</option>';
    modelSelect.innerHTML = '<option value="">Select Model</option>';
    
    let makers = [];
    if (type === 'Car') {
        makers = CAR_DATA.makers;
    } else if (type === 'Bike' || type === 'Scooter') {
        makers = BIKE_DATA.map(item => item.maker);
    }
    
    makers.forEach(maker => {
        const option = document.createElement('option');
        option.value = maker;
        option.textContent = maker;
        makeSelect.appendChild(option);
    });

    if (selectedMake) {
        makeSelect.value = selectedMake;
        populateVehicleModels(null); // Trigger model population if make is set
    }
};

window.populateVehicleModels = function(selectedModel = null) {
    const type = document.getElementById('vehicle-type').value;
    const make = document.getElementById('vehicle-make').value;
    const modelSelect = document.getElementById('vehicle-model');
    
    modelSelect.innerHTML = '<option value="">Select Model</option>';
    
    let models = [];
    if (type === 'Car') {
        models = CAR_DATA.models[make] || [];
    } else if (type === 'Bike' || type === 'Scooter') {
        const makerData = BIKE_DATA.find(m => m.maker === make);
        if (makerData) models = makerData.models.map(m => m.name);
    }

    models.forEach(modelName => {
        const option = document.createElement('option');
        option.value = modelName;
        option.textContent = modelName;
        modelSelect.appendChild(option);
    });

    if (selectedModel) {
        modelSelect.value = selectedModel;
    }
};

window.saveVehicle = async function() {
    const btn = document.getElementById('btn-save-vehicle');
    const user = auth.currentUser;
    const id = document.getElementById('vehicle-id').value;
    const name = document.getElementById('vehicle-name').value;
    const type = document.getElementById('vehicle-type').value;
    const reg = document.getElementById('vehicle-reg').value;
    const rcExpiry = document.getElementById('vehicle-rc-expiry').value;
    const year = document.getElementById('vehicle-year').value;
    const make = document.getElementById('vehicle-make').value;
    const model = document.getElementById('vehicle-model').value;
    const odo = parseInt(document.getElementById('vehicle-odometer').value) || 0;
    const fastagProvider = document.getElementById('vehicle-fastag-provider').value;
    const fastagBalance = parseFloat(document.getElementById('vehicle-fastag-balance').value) || 0;
    const fastagThreshold = parseFloat(document.getElementById('vehicle-fastag-threshold').value) || 0;
    const isPrimary = document.getElementById('vehicle-primary').checked;

    if (!name) {
        if(window.dashboard) window.dashboard.showNotification('Please enter vehicle name', 'warning');
        return;
    }

    try {
        window.setBtnLoading(btn, true);
        
        // Handle Primary Logic: Unset other primaries if this one is set
        if (isPrimary) {
            const batch = db.batch();
            const primaries = await db.collection('vehicles')
                .where('userId', '==', user.uid)
                .where('isPrimary', '==', true)
                .get();
            
            primaries.forEach(doc => {
                if (doc.id !== id) batch.update(doc.ref, { isPrimary: false });
            });
            await batch.commit();
        }

        const data = {
            userId: user.uid,
            fastagProvider, fastagBalance, fastagThreshold, rcExpiry,
            name, type, regNumber: reg, year, make, model, currentOdometer: odo, isPrimary
        };

        if (id) {
            await db.collection('vehicles').doc(id).update(data);
        } else {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('vehicles').add(data);
        }

        window.setBtnLoading(btn, false);
        bootstrap.Modal.getInstance(document.getElementById('addVehicleModal')).hide();
        loadVehicleDashboard();
        if(window.dashboard) window.dashboard.showNotification(id ? 'Vehicle updated' : 'Vehicle added', 'success');
        if(window.dashboard) window.dashboard.updateStats();
    } catch(e) {
        window.setBtnLoading(btn, false);
        if(window.dashboard) window.dashboard.showNotification('Error saving vehicle', 'danger');
    }
};

window.saveVehicleLog = async function() {
    const btn = document.getElementById('btn-save-vehicle-log');
    const user = auth.currentUser;
    const logId = document.getElementById('log-id').value;
    const vehicleId = document.getElementById('log-vehicle').value;
    const type = document.getElementById('log-type').value;
    const date = document.getElementById('log-date').value;
    const odometer = parseInt(document.getElementById('log-odometer').value);
    const cost = parseFloat(document.getElementById('log-cost').value);
    const notes = document.getElementById('log-notes').value;
    const paymentMode = document.getElementById('log-payment-mode').value;
    
    // Fuel specific
    const quantity = parseFloat(document.getElementById('log-quantity').value) || 0;
    const pricePerUnit = parseFloat(document.getElementById('log-price-unit').value) || 0;
    const fullTank = document.getElementById('log-full-tank').checked;
    
    // Service specific
    const serviceType = document.getElementById('log-service-type').value;

    if (!vehicleId || !date || !odometer || !cost) {
        if(window.dashboard) window.dashboard.showNotification('Please fill required fields', 'warning');
        return;
    }

    try {
    window.setBtnLoading(btn, true);
    // Calculate Mileage if Fuel
    let mileage = 0;
    if (type === 'fuel' && fullTank) {
        // Fetch last full tank log
        const lastLogSnap = await db.collection('vehicle_logs')
            .where('vehicleId', '==', vehicleId)
            .where('type', '==', 'fuel')
            .where('fullTank', '==', true)
            .orderBy('odometer', 'desc')
            .limit(1)
            .get();
        
        if (!lastLogSnap.empty) {
            const lastLog = lastLogSnap.docs[0].data();
            const dist = odometer - lastLog.odometer;
            if (dist > 0 && quantity > 0) {
                mileage = dist / quantity;
            }
        }
    }

    const logData = {
        userId: user.uid,
        vehicleId, type, date, odometer, cost, notes
    };

    if (type === 'fuel') {
        logData.quantity = quantity;
        logData.pricePerUnit = pricePerUnit;
        logData.fullTank = fullTank;
        if (mileage > 0) logData.mileage = mileage;
    } else if (type === 'service' || type === 'repair') {
        logData.serviceType = serviceType;
    }

    const vehicleName = document.getElementById('log-vehicle').options[document.getElementById('log-vehicle').selectedIndex].text;
    const description = `${vehicleName}: ${type.charAt(0).toUpperCase() + type.slice(1)}${notes ? ' - ' + notes : ''}`;

    if (logId) {
        // Update existing log
        logData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('vehicle_logs').doc(logId).update(logData);

        // Check if we need to update vehicle odometer (if this log is higher than current)
        const vDoc = await db.collection('vehicles').doc(vehicleId).get();
        if (vDoc.exists && (vDoc.data().currentOdometer || 0) < odometer) {
             await db.collection('vehicles').doc(vehicleId).update({ currentOdometer: odometer });
        }

        // Update associated transaction
        const txSnap = await db.collection('transactions').where('relatedId', '==', logId).get();
        if (!txSnap.empty) {
            await txSnap.docs[0].ref.update({
                date: date,
                amount: cost,
                description: description,
                paymentMode: paymentMode,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    } else {
        // Create new log
        logData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        const logRef = await db.collection('vehicle_logs').add(logData);
        
        const vehicleUpdateData = {};
        const vDoc = await db.collection('vehicles').doc(vehicleId).get();
        const currentOdo = vDoc.exists ? (vDoc.data().currentOdometer || 0) : 0;
        
        if (odometer > currentOdo) {
            vehicleUpdateData.currentOdometer = odometer;
        }

        // Calculate and update average mileage if applicable
        if (mileage > 0) {
            const mileageSnap = await db.collection('vehicle_logs')
                .where('vehicleId', '==', vehicleId)
                .where('mileage', '>', 0)
                .get();
                
            let totalM = mileage;
            let countM = 1;
            
            mileageSnap.forEach(doc => {
                if (doc.id !== logRef.id) {
                    totalM += doc.data().mileage;
                    countM++;
                }
            });
            vehicleUpdateData.averageMileage = totalM / countM;
        }

        // Deduct FASTag Balance ONLY if paid via Wallet
        if (type === 'toll' && paymentMode === 'fastag_wallet') {
            vehicleUpdateData.fastagBalance = firebase.firestore.FieldValue.increment(-cost);
        }

        // Update Vehicle if needed
        if (Object.keys(vehicleUpdateData).length > 0) {
            await db.collection('vehicles').doc(vehicleId).update(vehicleUpdateData);
        }

        // Add to Transaction Ledger ONLY if NOT paid via FASTag Wallet
        // (Because FASTag Wallet expenses are recorded when Recharging, not when spending at toll)
        if (paymentMode !== 'fastag_wallet') {
            const transactionData = {
                userId: user.uid,
                date: date,
                amount: cost,
                type: 'expense',
                category: type === 'fuel' ? 'Fuel' : (type === 'toll' ? 'Toll & Parking' : 'Vehicle Maintenance'),
                description: description,
                paymentMode: paymentMode,
                relatedId: logRef.id,
                section: 'vehicles',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            await db.collection('transactions').add(transactionData);
        }
    }

    window.setBtnLoading(btn, false);
    bootstrap.Modal.getInstance(document.getElementById('addVehicleLogModal')).hide();
    loadVehicleDashboard();
    if (window.dashboard) window.dashboard.showNotification(logId ? 'Log updated!' : 'Log added and linked to Ledger!', 'success');
    if (window.dashboard) window.dashboard.updateStats();
    } catch(e) {
        window.setBtnLoading(btn, false);
        if(window.dashboard) window.dashboard.showNotification('Error saving log', 'danger');
    }
};

window.saveServiceAlert = async function() {
    const btn = document.getElementById('btn-save-service-alert');
    const user = auth.currentUser;
    const id = document.getElementById('alert-id').value;
    const vehicleId = document.getElementById('alert-vehicle').value;
    const title = document.getElementById('alert-title').value;
    const dueOdometer = parseInt(document.getElementById('alert-due-odometer').value);

    if (!vehicleId || !title || !dueOdometer) {
        if(window.dashboard) window.dashboard.showNotification('Please fill all fields', 'warning');
        return;
    }

    try {
        window.setBtnLoading(btn, true);
        const data = {
            userId: user.uid,
            vehicleId,
            title,
            dueOdometer,
            status: 'active'
        };

        if (id) {
            data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('service_alerts').doc(id).update(data);
        } else {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('service_alerts').add(data);
        }

        window.setBtnLoading(btn, false);
        bootstrap.Modal.getInstance(document.getElementById('addServiceAlertModal')).hide();
        loadVehicleDashboard();
        if (window.dashboard) window.dashboard.showNotification(id ? 'Alert updated!' : 'Service alert set!', 'success');
    } catch(e) {
        window.setBtnLoading(btn, false);
        if(window.dashboard) window.dashboard.showNotification('Error saving alert', 'danger');
    }
};

window.editServiceAlert = async function(id) {
    try {
        const doc = await db.collection('service_alerts').doc(id).get();
        if (!doc.exists) return;
        const data = doc.data();
        
        document.getElementById('alert-id').value = id;
        
        // Ensure vehicle select is populated
        if (document.getElementById('alert-vehicle').options.length === 0) {
            await populateLogVehicleSelect(); // Reuse this or similar logic if available, or just rely on showAddServiceAlertModal logic if we refactor. 
            // Since populateLogVehicleSelect populates log-vehicle, we need to populate alert-vehicle.
            // Let's just call showAddServiceAlertModal to populate and then set values.
            await showAddServiceAlertModal();
        } else {
            const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addServiceAlertModal'));
            modal.show();
        }
        
        document.getElementById('alert-id').value = id; // Set again as showAddServiceAlertModal clears it
        document.getElementById('alert-vehicle').value = data.vehicleId;
        document.getElementById('alert-title').value = data.title;
        document.getElementById('alert-due-odometer').value = data.dueOdometer;
        
        updateAlertOdometerHelper();
    } catch(e) {
        console.error(e);
    }
};

window.deleteServiceAlert = async function(id) {
    if (!confirm('Delete this alert?')) return;
    
    try {
        if(window.dashboard) window.dashboard.showLoading();
        await db.collection('service_alerts').doc(id).delete();
        loadVehicleDashboard();
        if (window.dashboard) window.dashboard.showNotification('Alert deleted', 'success');
    } catch (error) {
        console.error("Error deleting alert:", error);
        if (window.dashboard) window.dashboard.showNotification('Permission error deleting alert', 'danger');
    } finally {
        if(window.dashboard) window.dashboard.hideLoading();
    }
};

window.showUpdateOdometerModal = function(vehicleId, currentOdo) {
    document.getElementById('update-odo-vehicle-id').value = vehicleId;
    document.getElementById('update-odo-value').value = currentOdo;
    document.getElementById('update-odo-value').min = currentOdo;
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('updateOdometerModal'));
    modal.show();
};

window.saveOdometerUpdate = async function() {
    const id = document.getElementById('update-odo-vehicle-id').value;
    const newOdo = parseInt(document.getElementById('update-odo-value').value);
    
    if (!newOdo) return;

    try {
        if(window.dashboard) window.dashboard.showLoading();
        await db.collection('vehicles').doc(id).update({
            currentOdometer: newOdo,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        bootstrap.Modal.getInstance(document.getElementById('updateOdometerModal')).hide();
        loadVehicleDashboard();
        if(window.dashboard) window.dashboard.showNotification('Odometer updated', 'success');
        if(window.dashboard) window.dashboard.updateStats();
    } catch(e) {
        console.error(e);
        if(window.dashboard) window.dashboard.showNotification('Error updating odometer', 'danger');
    } finally {
        if(window.dashboard) window.dashboard.hideLoading();
    }
};

window.calculateMaintenanceEvents = async function() {
    const user = auth.currentUser;
    
    // 1. Fetch Vehicles
    const vSnap = await db.collection('vehicles').where('userId', '==', user.uid).get();
    const vehicles = {};
    vSnap.forEach(d => vehicles[d.id] = d.data());

    // 2. Fetch Alerts
    const alertsSnap = await db.collection('service_alerts').where('userId', '==', user.uid).get();
    
    if (alertsSnap.empty) {
        return [];
    }

    // 3. Calculate Daily Usage for each vehicle
    const vehicleUsage = {}; // km per day
    for (const vId of Object.keys(vehicles)) {
        const logsSnap = await db.collection('vehicle_logs')
            .where('userId', '==', user.uid)
            .where('vehicleId', '==', vId)
            .orderBy('date', 'asc')
            .get();
        
        if (logsSnap.size >= 2) {
            const first = logsSnap.docs[0].data();
            const last = logsSnap.docs[logsSnap.size - 1].data();
            
            const daysDiff = (new Date(last.date) - new Date(first.date)) / (1000 * 60 * 60 * 24);
            const distDiff = last.odometer - first.odometer;
            
            if (daysDiff > 0 && distDiff > 0) {
                vehicleUsage[vId] = distDiff / daysDiff;
            } else {
                vehicleUsage[vId] = 30; // Default fallback
            }
        } else {
            vehicleUsage[vId] = 30; // Default fallback (approx 900km/month)
        }
    }

    // 4. Map Alerts to Dates
    const events = [];
    alertsSnap.forEach(doc => {
        const alert = doc.data();
        const vehicle = vehicles[alert.vehicleId];
        if (!vehicle) return;

        const remainingKm = alert.dueOdometer - vehicle.currentOdometer;
        const dailyKm = vehicleUsage[alert.vehicleId];
        const daysRemaining = Math.ceil(remainingKm / dailyKm);
        
        const estimatedDate = new Date();
        estimatedDate.setDate(estimatedDate.getDate() + daysRemaining);
        
        events.push({
            id: doc.id,
            title: alert.title,
            vehicleName: vehicle.name,
            date: estimatedDate,
            remainingKm: remainingKm,
            status: remainingKm < 0 ? 'overdue' : (remainingKm < 500 ? 'soon' : 'future')
        });
    });

    // 5. Add Document Expiries
    Object.values(vehicles).forEach(v => {
        // RC Expiry (Root)
        if (v.rcExpiry) {
            const expiryDate = new Date(v.rcExpiry);
            const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
            events.push({
                id: `${v.id}_RC`,
                title: `RC Expiry`,
                vehicleName: v.name,
                date: expiryDate,
                remainingKm: null,
                status: daysLeft < 0 ? 'overdue' : (daysLeft < 30 ? 'soon' : 'future'),
                daysLeft: daysLeft
            });
        }

        if (v.documents && Array.isArray(v.documents)) {
            v.documents.forEach(d => {
                const expiryDate = new Date(d.expiry);
                const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
                
                events.push({
                    id: `${v.id}_${d.type}`,
                    title: `${d.type} Expiry`,
                    vehicleName: v.name,
                    date: expiryDate,
                    remainingKm: null, // Flag for doc
                    status: daysLeft < 0 ? 'overdue' : (daysLeft < 30 ? 'soon' : 'future'),
                    daysLeft: daysLeft
                });
            });
        }
    });

    // Sort by date
    events.sort((a, b) => a.date - b.date);
    return events;
};

window.exportMaintenanceSchedule = async function() {
    if(window.dashboard) window.dashboard.showLoading();
    try {
        const events = await calculateMaintenanceEvents();
        if (events.length === 0) {
            if(window.dashboard) window.dashboard.showNotification('No events to export', 'warning');
            return;
        }

        let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//PersonalOS//Vehicle Maintenance//EN\n";
        
        events.forEach(e => {
            const startDate = e.date.toISOString().replace(/-|:|\.\d\d\d/g, "").substring(0, 8);
            
            icsContent += "BEGIN:VEVENT\n";
            icsContent += `DTSTART;VALUE=DATE:${startDate}\n`;
            icsContent += `SUMMARY:${e.title} - ${e.vehicleName}\n`;
            icsContent += `DESCRIPTION:Vehicle: ${e.vehicleName}\\nService: ${e.title}\\nEstimated due date based on usage.\n`;
            icsContent += "END:VEVENT\n";
        });
        
        icsContent += "END:VCALENDAR";
        
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', 'maintenance_schedule.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if(window.dashboard) window.dashboard.showNotification('Schedule exported! Import the .ics file to Google Calendar.', 'success');

    } catch (e) {
        console.error("Error exporting schedule:", e);
        if(window.dashboard) window.dashboard.showNotification('Error exporting schedule', 'danger');
    } finally {
        if(window.dashboard) window.dashboard.hideLoading();
    }
};

window.loadMaintenanceSchedule = async function() {
    const container = document.getElementById('vehicles-content');
    container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div><p class="mt-2">Calculating schedule...</p></div>';

    try {
        const events = await calculateMaintenanceEvents();

        if (events.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-5">No service alerts set or calculated. Add alerts to see the schedule.</div>';
            return;
        }

        // 5. Render Calendar View (List of Months)
        let html = `
            <div class="d-flex justify-content-end mb-3">
                <button class="btn btn-sm btn-outline-primary" onclick="exportMaintenanceSchedule()">
                    <i class="fas fa-calendar-alt me-2"></i>Export to Calendar
                </button>
            </div>
            <div class="row g-4">
        `;
        
        // Group by Month
        const grouped = {};
        events.forEach(e => {
            const key = e.date.toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(e);
        });

        if (Object.keys(grouped).length === 0) {
            html += '<div class="col-12 text-center">No upcoming services predicted.</div>';
        }

        for (const [month, monthEvents] of Object.entries(grouped)) {
            html += `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 border-0 shadow-sm rounded-4">
                        <div class="card-header bg-transparent border-bottom fw-bold text-primary py-3">
                            <i class="fas fa-calendar-alt me-2"></i>${month}
                        </div>
                        <div class="list-group list-group-flush">
            `;
            
            monthEvents.forEach(e => {
                let badgeClass = 'bg-success';
                let dateText = e.date.getDate();
                
                if (e.status === 'overdue') {
                    badgeClass = 'bg-danger';
                    dateText = 'Overdue';
                } else if (e.status === 'soon') {
                    badgeClass = 'bg-warning text-dark';
                }

                let subText = '';
                if (e.remainingKm !== null) subText = e.remainingKm > 0 ? e.remainingKm + ' km left' : 'Overdue';
                else {
                    subText = e.daysLeft < 0 ? `Expired ${Math.abs(e.daysLeft)} days ago` : `${e.daysLeft} days left`;
                }

                html += `
                    <div class="list-group-item">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <div class="fw-bold">${e.title}</div>
                                <small class="text-muted">${e.vehicleName}</small>
                            </div>
                            <div class="text-end">
                                <span class="badge ${badgeClass} mb-1">${dateText}</span>
                                <div class="small text-muted">${subText}</div>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `
                        </div>
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        container.innerHTML = html;

    } catch (error) {
        console.error("Error loading schedule:", error);
        container.innerHTML = '<div class="text-center text-danger py-5">Error loading schedule.</div>';
    }
};

window.editVehicle = async function(id) {
    // Failsafe: Ensure loading spinner doesn't get stuck if DB hangs
    const loadingTimeout = setTimeout(() => {
        if(window.dashboard) window.dashboard.hideLoading();
    }, 8000);

    try {
        if(window.dashboard) window.dashboard.showLoading();
        const doc = await db.collection('vehicles').doc(id).get();
        
        if (!doc.exists) {
            if(window.dashboard) window.dashboard.showNotification('Vehicle not found', 'warning');
            return;
        }
        
        const data = doc.data();
        
        // Helper to safely set values
        const setVal = (eid, val) => { const el = document.getElementById(eid); if(el) el.value = val; };
        
        setVal('vehicle-id', id);
        setVal('vehicle-name', data.name || '');
        setVal('vehicle-type', data.type || 'Car');
        setVal('vehicle-reg', data.regNumber || '');
        setVal('vehicle-rc-expiry', data.rcExpiry || '');
        setVal('vehicle-year', data.year || '');
        
        // Populate dropdowns with saved values
        populateVehicleYears();
        setVal('vehicle-year', data.year || ''); // Set again after population
        populateVehicleMakes(data.make);
        populateVehicleModels(data.model);

        setVal('vehicle-odometer', data.currentOdometer !== undefined ? data.currentOdometer : 0);
        setVal('vehicle-fastag-provider', data.fastagProvider || '');
        setVal('vehicle-fastag-balance', data.fastagBalance !== undefined ? data.fastagBalance : '');
        setVal('vehicle-fastag-threshold', data.fastagThreshold !== undefined ? data.fastagThreshold : '');
        toggleFastagBalanceField();
        
        const primaryEl = document.getElementById('vehicle-primary');
        if (primaryEl) primaryEl.checked = data.isPrimary || false;
        
        const modalEl = document.getElementById('addVehicleModal');
        if (modalEl && typeof bootstrap !== 'undefined') {
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        }
    } catch(e) {
        console.error("Error editing vehicle:", e);
        if(window.dashboard) window.dashboard.showNotification('Error loading vehicle', 'danger');
    } finally {
        clearTimeout(loadingTimeout);
        if(window.dashboard) window.dashboard.hideLoading();
    }
};

window.showFastagRechargeModal = function(vehicleId) {
    document.getElementById('recharge-vehicle-id').value = vehicleId;
    document.getElementById('recharge-amount').value = '';
    document.getElementById('recharge-date').value = new Date().toISOString().split('T')[0];
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('fastagRechargeModal'));
    modal.show();
};

window.saveFastagRecharge = async function() {
    const vehicleId = document.getElementById('recharge-vehicle-id').value;
    const amount = parseFloat(document.getElementById('recharge-amount').value);
    const date = document.getElementById('recharge-date').value;
    const paymentMode = document.getElementById('recharge-payment-mode').value;
    const user = auth.currentUser;

    if (!amount || amount <= 0) {
        if(window.dashboard) window.dashboard.showNotification('Invalid amount', 'warning');
        return;
    }

    try {
        if(window.dashboard) window.dashboard.showLoading();
        const batch = db.batch();
        
        // 1. Update Vehicle Balance
        const vehicleRef = db.collection('vehicles').doc(vehicleId);
        batch.update(vehicleRef, {
            fastagBalance: firebase.firestore.FieldValue.increment(amount),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 2. Add Vehicle Log (Internal Record)
        const logRef = db.collection('vehicle_logs').doc();
        batch.set(logRef, {
            userId: user.uid,
            vehicleId: vehicleId,
            type: 'fastag_recharge',
            date: date,
            cost: amount,
            odometer: 0, // Not relevant for recharge
            notes: 'FASTag Recharge',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 3. Add Transaction to Ledger (The Actual Expense)
        const txRef = db.collection('transactions').doc();
        batch.set(txRef, {
            userId: user.uid,
            date: date,
            amount: amount,
            type: 'expense',
            category: 'Vehicle Maintenance', // or create a specific 'FASTag' category
            description: 'FASTag Recharge',
            paymentMode: paymentMode,
            relatedId: logRef.id,
            section: 'vehicles',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        await batch.commit();
        
        bootstrap.Modal.getInstance(document.getElementById('fastagRechargeModal')).hide();
        loadVehicleDashboard();
        if(window.dashboard) window.dashboard.showNotification('Recharge successful', 'success');
    } catch(e) {
        console.error(e);
        if(window.dashboard) window.dashboard.showNotification('Error recharging', 'danger');
    } finally {
        if(window.dashboard) window.dashboard.hideLoading();
    }
};

window.deleteVehicle = async function(id) {
    if (!confirm('Delete this vehicle? This will also delete all associated logs and alerts.')) return;
    
    try {
        if(window.dashboard) window.dashboard.showLoading();
        const batch = db.batch();
        
        // Delete vehicle
        batch.delete(db.collection('vehicles').doc(id));
        
        // Delete logs
        const logsSnap = await db.collection('vehicle_logs').where('vehicleId', '==', id).get();
        logsSnap.forEach(doc => batch.delete(doc.ref));
        
        // Delete alerts
        const alertsSnap = await db.collection('service_alerts').where('vehicleId', '==', id).get();
        alertsSnap.forEach(doc => batch.delete(doc.ref));
        
        await batch.commit();
        
        if (window.dashboard) window.dashboard.showNotification('Vehicle deleted', 'success');
        loadVehicleDashboard();
    } catch(e) {
        if(window.dashboard) window.dashboard.showNotification('Error deleting vehicle', 'danger');
    } finally {
        if(window.dashboard) window.dashboard.hideLoading();
    }
};

window.editVehicleLog = async function(id) {
    await populateLogVehicleSelect();
    const doc = await db.collection('vehicle_logs').doc(id).get();
    if (!doc.exists) return;
    const data = doc.data();
    
    // Populate form
    document.getElementById('log-id').value = id;
    document.getElementById('log-vehicle').value = data.vehicleId;
    document.getElementById('log-type').value = data.type;
    document.getElementById('log-date').value = data.date;
    document.getElementById('log-odometer').value = data.odometer;
    document.getElementById('log-cost').value = data.cost;
    document.getElementById('log-notes').value = data.notes || '';
    
    // Trigger change events to show correct fields
    toggleLogFields();
    
    if (data.type === 'fuel') {
        document.getElementById('log-price-unit').value = data.pricePerUnit || '';
        document.getElementById('log-quantity').value = data.quantity || '';
        document.getElementById('log-full-tank').checked = data.fullTank || false;
    } else if (data.type === 'service' || data.type === 'repair') {
        document.getElementById('log-service-type').value = data.serviceType || 'Other';
    }
    
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addVehicleLogModal'));
    modal.show();
};

window.deleteVehicleLog = async function(id) {
    if (!confirm('Delete this log?')) return;
    
    try {
        if(window.dashboard) window.dashboard.showLoading();
        await db.collection('vehicle_logs').doc(id).delete();
        
        // Delete associated transaction
        const txSnap = await db.collection('transactions').where('relatedId', '==', id).get();
        txSnap.forEach(doc => doc.ref.delete());
        
        loadVehicleDashboard();
        if (window.dashboard) window.dashboard.showNotification('Log deleted', 'success');
    } catch(e) {
        if(window.dashboard) window.dashboard.showNotification('Error deleting log', 'danger');
    } finally {
        if(window.dashboard) window.dashboard.hideLoading();
    }
};
