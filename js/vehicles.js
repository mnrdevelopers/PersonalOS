let currentVehicleTab = 'logs';

window.loadVehiclesSection = async function() {
    const container = document.getElementById('vehicles-section');
    container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Vehicle Tracker</h2>
            <div>
                <button class="btn btn-outline-primary me-2" onclick="showAddVehicleModal()">
                    <i class="fas fa-car me-2"></i>Add Vehicle
                </button>
                <button class="btn btn-primary" onclick="showAddVehicleLogModal()">
                    <i class="fas fa-plus me-2"></i>Add Log
                </button>
                <button class="btn btn-outline-warning ms-2" onclick="showAddServiceAlertModal()">
                    <i class="fas fa-bell me-2"></i>Set Alert
                </button>
            </div>
        </div>

        <!-- Stats Row -->
        <div class="row g-3 mb-4" id="vehicle-stats">
            <div class="col-12 text-center"><div class="spinner-border text-primary"></div></div>
        </div>

        <ul class="nav nav-tabs mb-4">
            <li class="nav-item">
                <a class="nav-link active" href="javascript:void(0)" onclick="switchVehicleTab('logs', this)">Logs & History</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="javascript:void(0)" onclick="switchVehicleTab('schedule', this)">Maintenance Schedule</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="javascript:void(0)" onclick="switchVehicleTab('alerts', this)">Service Alerts</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="javascript:void(0)" onclick="switchVehicleTab('vehicles', this)">My Vehicles</a>
            </li>
        </ul>

        <div id="vehicles-content">
            <!-- Content loaded here -->
        </div>

        <!-- Add Vehicle Modal -->
        <div class="modal fade" id="addVehicleModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
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
                                    <select class="form-select" id="vehicle-type">
                                        <option value="Car">Car</option>
                                        <option value="Bike">Bike</option>
                                        <option value="Scooter">Scooter</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div class="col-6 mb-3">
                                    <label class="form-label">Reg. Number</label>
                                    <input type="text" class="form-control" id="vehicle-reg">
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-6 mb-3">
                                    <label class="form-label">Make</label>
                                    <input type="text" class="form-control" id="vehicle-make" placeholder="e.g. Honda">
                                </div>
                                <div class="col-6 mb-3">
                                    <label class="form-label">Model</label>
                                    <input type="text" class="form-control" id="vehicle-model" placeholder="e.g. City">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Current Odometer (km)</label>
                                <input type="number" class="form-control" id="vehicle-odometer" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="saveVehicle()">Save Vehicle</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Log Modal -->
        <div class="modal fade" id="addVehicleLogModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
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
                        <button type="button" class="btn btn-primary" onclick="saveVehicleLog()">Save Log</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Service Alert Modal -->
        <div class="modal fade" id="addServiceAlertModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
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
                        <button type="button" class="btn btn-primary" onclick="saveServiceAlert()">Save Alert</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    await loadVehicleStats();
    await loadVehicleLogs();
};

window.switchVehicleTab = function(tab, element) {
    currentVehicleTab = tab;
    document.querySelectorAll('#vehicles-section .nav-link').forEach(l => l.classList.remove('active'));
    element.classList.add('active');
    
    if (tab === 'logs') loadVehicleLogs();
    else if (tab === 'alerts') loadServiceAlerts();
    else if (tab === 'schedule') loadMaintenanceSchedule();
    else loadVehiclesList();
};

window.showAddVehicleModal = function() {
    const modal = new bootstrap.Modal(document.getElementById('addVehicleModal'));
    document.getElementById('vehicle-form').reset();
    document.getElementById('vehicle-id').value = '';
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
        option.dataset.odometer = v.currentOdometer || 0;
        select.appendChild(option);
    });
    return true;
};

window.showAddVehicleLogModal = async function() {
    const hasVehicles = await populateLogVehicleSelect();
    
    if (!hasVehicles) {
        alert('Please add a vehicle first.');
        showAddVehicleModal();
        return;
    }

    const modal = new bootstrap.Modal(document.getElementById('addVehicleLogModal'));
    document.getElementById('vehicle-log-form').reset();
    document.getElementById('log-id').value = '';
    document.getElementById('log-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('log-type').value = 'fuel';
    toggleLogFields();
    updateLogOdometerPlaceholder();
    modal.show();
};

window.showAddServiceAlertModal = async function() {
    const user = auth.currentUser;
    const snapshot = await db.collection('vehicles').where('userId', '==', user.uid).get();
    
    if (snapshot.empty) {
        alert('Please add a vehicle first.');
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

    const modal = new bootstrap.Modal(document.getElementById('addServiceAlertModal'));
    document.getElementById('service-alert-form').reset();
    updateAlertOdometerHelper();
    modal.show();
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

window.saveVehicle = async function() {
    const user = auth.currentUser;
    const id = document.getElementById('vehicle-id').value;
    const name = document.getElementById('vehicle-name').value;
    const type = document.getElementById('vehicle-type').value;
    const reg = document.getElementById('vehicle-reg').value;
    const make = document.getElementById('vehicle-make').value;
    const model = document.getElementById('vehicle-model').value;
    const odo = parseInt(document.getElementById('vehicle-odometer').value) || 0;

    if (!name) return;

    const data = {
        userId: user.uid,
        name, type, regNumber: reg, make, model, currentOdometer: odo
    };

    if (id) {
        await db.collection('vehicles').doc(id).update(data);
    } else {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('vehicles').add(data);
    }

    bootstrap.Modal.getInstance(document.getElementById('addVehicleModal')).hide();
    loadVehicleStats();
    if (currentVehicleTab === 'vehicles') loadVehiclesList();
};

window.saveVehicleLog = async function() {
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
        alert('Please fill required fields');
        return;
    }

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
        
        // Update Vehicle Odometer (simple logic: update if new log has higher odo)
        await db.collection('vehicles').doc(vehicleId).update({
            currentOdometer: odometer
        });

        // Add to Transaction Ledger
        const transactionData = {
            userId: user.uid,
            date: date,
            amount: cost,
            type: 'expense',
            category: type === 'fuel' ? 'Fuel' : 'Vehicle Maintenance',
            description: description,
            paymentMode: paymentMode,
            relatedId: logRef.id,
            section: 'vehicles',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('transactions').add(transactionData);
    }

    bootstrap.Modal.getInstance(document.getElementById('addVehicleLogModal')).hide();
    loadVehicleStats();
    if (currentVehicleTab === 'logs') loadVehicleLogs();
    if (window.dashboard) window.dashboard.showNotification(logId ? 'Log updated!' : 'Log added and linked to Ledger!', 'success');
};

window.saveServiceAlert = async function() {
    const user = auth.currentUser;
    const vehicleId = document.getElementById('alert-vehicle').value;
    const title = document.getElementById('alert-title').value;
    const dueOdometer = parseInt(document.getElementById('alert-due-odometer').value);

    if (!vehicleId || !title || !dueOdometer) {
        alert('Please fill all fields');
        return;
    }

    await db.collection('service_alerts').add({
        userId: user.uid,
        vehicleId,
        title,
        dueOdometer,
        status: 'active',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    bootstrap.Modal.getInstance(document.getElementById('addServiceAlertModal')).hide();
    if (currentVehicleTab === 'alerts') loadServiceAlerts();
    if (window.dashboard) window.dashboard.showNotification('Service alert set!', 'success');
};

window.deleteServiceAlert = async function(id) {
    if (!confirm('Delete this alert?')) return;
    
    try {
        await db.collection('service_alerts').doc(id).delete();
        if (currentVehicleTab === 'alerts') loadServiceAlerts();
        else if (currentVehicleTab === 'schedule') loadMaintenanceSchedule();
        if (window.dashboard) window.dashboard.showNotification('Alert deleted', 'success');
    } catch (error) {
        console.error("Error deleting alert:", error);
        if (window.dashboard) window.dashboard.showNotification('Permission error deleting alert', 'danger');
    }
};

window.loadVehicleStats = async function() {
    const user = auth.currentUser;
    const logsSnap = await db.collection('vehicle_logs').where('userId', '==', user.uid).get();
    
    let totalCost = 0;
    let fuelCost = 0;
    let serviceCost = 0;

    logsSnap.forEach(doc => {
        const d = doc.data();
        totalCost += d.cost;
        if (d.type === 'fuel') fuelCost += d.cost;
        else serviceCost += d.cost;
    });

    const container = document.getElementById('vehicle-stats');
    container.innerHTML = `
        <div class="col-md-4">
            <div class="card bg-light border-primary h-100">
                <div class="card-body text-center">
                    <h6 class="text-primary">Total Expenses</h6>
                    <h3>₹${totalCost.toFixed(2)}</h3>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card bg-light border-warning h-100">
                <div class="card-body text-center">
                    <h6 class="text-warning">Fuel Cost</h6>
                    <h3>₹${fuelCost.toFixed(2)}</h3>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card bg-light border-info h-100">
                <div class="card-body text-center">
                    <h6 class="text-info">Maintenance</h6>
                    <h3>₹${serviceCost.toFixed(2)}</h3>
                </div>
            </div>
        </div>
    `;
};

window.loadVehicleLogs = async function() {
    const user = auth.currentUser;
    const container = document.getElementById('vehicles-content');
    
    // Fetch vehicles map for names
    const vSnap = await db.collection('vehicles').where('userId', '==', user.uid).get();
    const vehicles = {};
    vSnap.forEach(d => vehicles[d.id] = d.data());

    const logsSnap = await db.collection('vehicle_logs')
        .where('userId', '==', user.uid)
        .orderBy('date', 'desc')
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

    if (logsSnap.empty) {
        container.innerHTML = '<div class="text-center text-muted py-5">No logs found. Add your first fuel or service record.</div>';
        return;
    }

    let html = '<div class="table-responsive"><table class="table table-hover"><thead><tr><th>Date</th><th>Vehicle</th><th>Type</th><th>Odometer</th><th>Cost</th><th>Details</th><th>Actions</th></tr></thead><tbody>';
    
    logsSnap.forEach(doc => {
        const d = doc.data();
        const vName = vehicles[d.vehicleId]?.name || 'Unknown';
        let details = d.notes || '';
        if (d.type === 'fuel') {
            details = `${d.quantity}L @ ₹${d.pricePerUnit}/L ${d.mileage ? `<br><span class="badge bg-success">${d.mileage.toFixed(1)} km/l</span>` : ''}`;
        } else if (d.type === 'service') {
            details = `<span class="fw-bold">${d.serviceType}</span><br>${d.notes || ''}`;
        }
        
        let typeBadge = 'bg-secondary';
        if (d.type === 'fuel') typeBadge = 'bg-warning text-dark';
        if (d.type === 'service') typeBadge = 'bg-info';
        if (d.type === 'repair') typeBadge = 'bg-danger';

        html += `
            <tr>
                <td>${new Date(d.date).toLocaleDateString()}</td>
                <td>${vName}</td>
                <td><span class="badge ${typeBadge}">${d.type.toUpperCase()}</span></td>
                <td>${d.odometer} km</td>
                <td class="fw-bold">₹${d.cost.toFixed(2)}</td>
                <td class="small">${details}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editVehicleLog('${doc.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteVehicleLog('${doc.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;
};

window.loadServiceAlerts = async function() {
    const user = auth.currentUser;
    const container = document.getElementById('vehicles-content');
    
    // Fetch vehicles for current odometer
    const vSnap = await db.collection('vehicles').where('userId', '==', user.uid).get();
    const vehicles = {};
    vSnap.forEach(d => vehicles[d.id] = d.data());

    const alertsSnap = await db.collection('service_alerts')
        .where('userId', '==', user.uid)
        .orderBy('dueOdometer', 'asc')
        .get();

    if (alertsSnap.empty) {
        container.innerHTML = '<div class="text-center text-muted py-5">No active service alerts. Set one to get reminded!</div>';
        return;
    }

    let html = '<div class="row g-4">';
    alertsSnap.forEach(doc => {
        const d = doc.data();
        const v = vehicles[d.vehicleId];
        if (!v) return;

        const remaining = d.dueOdometer - v.currentOdometer;
        let statusColor = 'success';
        let statusText = `${remaining} km to go`;
        let progress = 100 - (remaining / 5000 * 100); // Arbitrary scale for visual
        
        if (remaining <= 0) {
            statusColor = 'danger';
            statusText = `Overdue by ${Math.abs(remaining)} km`;
            progress = 100;
        } else if (remaining < 500) {
            statusColor = 'warning';
            statusText = `Due soon (${remaining} km)`;
        }

        html += `
            <div class="col-md-6">
                <div class="card border-${statusColor}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5 class="card-title">${d.title}</h5>
                                <h6 class="text-muted mb-2">${v.name}</h6>
                            </div>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteServiceAlert('${doc.id}')"><i class="fas fa-trash"></i></button>
                        </div>
                        <div class="mt-3">
                            <div class="d-flex justify-content-between small mb-1">
                                <span>Current: ${v.currentOdometer} km</span>
                                <span class="fw-bold text-${statusColor}">Target: ${d.dueOdometer} km</span>
                            </div>
                            <div class="progress" style="height: 10px;">
                                <div class="progress-bar bg-${statusColor}" role="progressbar" style="width: ${Math.max(5, Math.min(100, progress))}%"></div>
                            </div>
                            <div class="text-end mt-1 small text-${statusColor}">${statusText}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
};

window.loadMaintenanceSchedule = async function() {
    const user = auth.currentUser;
    const container = document.getElementById('vehicles-content');
    container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div><p class="mt-2">Calculating schedule...</p></div>';

    try {
        // 1. Fetch Vehicles
        const vSnap = await db.collection('vehicles').where('userId', '==', user.uid).get();
        const vehicles = {};
        vSnap.forEach(d => vehicles[d.id] = d.data());

        // 2. Fetch Alerts
        const alertsSnap = await db.collection('service_alerts').where('userId', '==', user.uid).get();
        
        if (alertsSnap.empty) {
            container.innerHTML = '<div class="text-center text-muted py-5">No service alerts set. Add alerts to see the schedule.</div>';
            return;
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

        // Sort by date
        events.sort((a, b) => a.date - b.date);

        // 5. Render Calendar View (List of Months)
        let html = '<div class="row g-4">';
        
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
                    <div class="card h-100">
                        <div class="card-header bg-light fw-bold text-primary">
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

                html += `
                    <div class="list-group-item">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <div class="fw-bold">${e.title}</div>
                                <small class="text-muted">${e.vehicleName}</small>
                            </div>
                            <div class="text-end">
                                <span class="badge ${badgeClass} mb-1">${dateText}</span>
                                <div style="font-size: 0.7rem;" class="text-muted">${e.remainingKm > 0 ? e.remainingKm + ' km left' : 'Overdue'}</div>
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

window.loadVehiclesList = async function() {
    const user = auth.currentUser;
    const container = document.getElementById('vehicles-content');
    const snapshot = await db.collection('vehicles').where('userId', '==', user.uid).get();

    if (snapshot.empty) {
        container.innerHTML = '<div class="text-center text-muted py-5">No vehicles added yet.</div>';
        return;
    }

    let html = '<div class="row g-4">';
    snapshot.forEach(doc => {
        const d = doc.data();
        const icon = d.type === 'Bike' || d.type === 'Scooter' ? 'fa-motorcycle' : 'fa-car';
        
        html += `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="d-flex align-items-center">
                                <div class="bg-light rounded-circle p-3 me-3 text-primary">
                                    <i class="fas ${icon} fa-lg"></i>
                                </div>
                                <div>
                                    <h5 class="card-title mb-0">${d.name}</h5>
                                    <small class="text-muted">${d.make} ${d.model}</small>
                                </div>
                            </div>
                            <div class="d-flex flex-column align-items-end">
                                <span class="badge bg-secondary mb-2">${d.type}</span>
                                <div class="dropdown">
                                    <button class="btn btn-link text-muted p-0" data-bs-toggle="dropdown">
                                        <i class="fas fa-ellipsis-v"></i>
                                    </button>
                                    <ul class="dropdown-menu dropdown-menu-end">
                                        <li><a class="dropdown-item" href="javascript:void(0)" onclick="editVehicle('${doc.id}')"><i class="fas fa-edit me-2"></i>Edit</a></li>
                                        <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="deleteVehicle('${doc.id}')"><i class="fas fa-trash me-2"></i>Delete</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="mb-2">
                            <small class="text-muted d-block">Registration: <span class="text-dark fw-bold">${d.regNumber || 'N/A'}</span></small>
                            <small class="text-muted d-block">Odometer: <span class="text-dark fw-bold">${d.currentOdometer} km</span></small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
};

window.editVehicle = async function(id) {
    const doc = await db.collection('vehicles').doc(id).get();
    if (!doc.exists) return;
    const data = doc.data();
    
    document.getElementById('vehicle-id').value = id;
    document.getElementById('vehicle-name').value = data.name;
    document.getElementById('vehicle-type').value = data.type;
    document.getElementById('vehicle-reg').value = data.regNumber || '';
    document.getElementById('vehicle-make').value = data.make || '';
    document.getElementById('vehicle-model').value = data.model || '';
    document.getElementById('vehicle-odometer').value = data.currentOdometer;
    
    const modal = new bootstrap.Modal(document.getElementById('addVehicleModal'));
    modal.show();
};

window.deleteVehicle = async function(id) {
    if (!confirm('Delete this vehicle? This will also delete all associated logs and alerts.')) return;
    
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
    loadVehiclesList();
    loadVehicleStats();
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
    
    const modal = new bootstrap.Modal(document.getElementById('addVehicleLogModal'));
    modal.show();
};

window.deleteVehicleLog = async function(id) {
    if (!confirm('Delete this log?')) return;
    
    await db.collection('vehicle_logs').doc(id).delete();
    
    // Delete associated transaction
    const txSnap = await db.collection('transactions').where('relatedId', '==', id).get();
    txSnap.forEach(doc => doc.ref.delete());
    
    loadVehicleLogs();
    loadVehicleStats();
    if (window.dashboard) window.dashboard.showNotification('Log deleted', 'success');
};
