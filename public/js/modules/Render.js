/**
 * Pure functions for rendering UI components
 */
export default class Render {
    
    static createRoosterCard(rooster) {
        const card = document.createElement('div');
        card.className = 'flip-card';
        card.innerHTML = `
            <div class="flip-card-inner">
                <div class="flip-card-front">
                    <img src="${rooster.image_url || 'images/rooster1.jpg'}" alt="${rooster.name}" class="card-image" onerror="this.src='https://placehold.co/400x320?text=No+Image'">
                    <div class="card-details-front">
                        <span class="btn btn-sm btn-secondary pointer-events-none">Ver Genealogía</span>
                    </div>
                </div>
                <div class="flip-card-back">
                    <h3 class="mb-sm">${rooster.name}</h3>
                    <div class="genealogy-tree w-full" style="text-align: left;">
                        <div class="genealogy-item"><span class="genealogy-label"><strong>Padre:</strong></span> ${rooster.genealogy?.fatherName || 'N/A'}</div>
                        <div class="genealogy-item"><span class="genealogy-label"><strong>Madre:</strong></span> ${rooster.genealogy?.motherName || 'N/A'}</div>
                        <div class="genealogy-item"><span class="genealogy-label"><strong>Línea:</strong></span> ${rooster.strain || 'N/A'}</div>
                        <div class="genealogy-item"><span class="genealogy-label"><strong>Placa No.:</strong></span> ${rooster.plate || 'N/A'}</div>
                    </div>
                    <div class="mt-md w-full flex-gap-1 justify-center">
                        <a href="genealogy.html?id=${rooster.id}" class="btn btn-secondary btn-sm" style="flex: 1;">Linaje</a>
                        <a href="contact.html?rooster=${rooster.id}" class="btn btn-primary btn-sm" style="flex: 1;">Contactar</a>
                    </div>
                </div>
            </div>
        `;
        return card;
    }

    static renderInventoryTable(roosters, selector = '.inventory-table', permissions = { canEdit: false, canDelete: false }) {
        const tbody = document.querySelector(`${selector} tbody`);
        if(!tbody) return;

        // 1. Destroy existing DataTable
        if ($.fn.DataTable.isDataTable(selector)) {
            $(selector).DataTable().destroy();
        }

        // 2. Populate DOM
        tbody.innerHTML = '';
        roosters.forEach(r => {
            const months = this.calculateAgeInMonths(r.birth_date);
            const tr = document.createElement('tr');
            
            // Action Buttons based on Role
            let actions = '';
            
            // Common Actions (View Linaje)
            actions += `<a href="genealogy.html?id=${r.id}" class="btn-icon" title="Ver Linaje" style="background:#17a2b8; color:white; border:none; padding:5px; border-radius:4px; cursor:pointer; text-decoration:none; margin-right: 4px;">🌳</a>`;

            // Permission Based Actions
            if (permissions.canEdit) {
                // Cart (Assuming Employees can sell)
                 actions += `<button class="btn-icon btn-cart" data-id="${r.id}" title="Añadir al Carrito" style="background:#28a745; color:white; border:none; padding:5px; border-radius:4px; cursor:pointer; margin-right: 4px;">🛒</button>`;
                 
                 // Edit
                 actions += `<button class="btn-icon btn-edit" data-id="${r.id}" title="Editar" style="background:#ffc107; color:black; border:none; padding:5px; border-radius:4px; cursor:pointer; margin-right: 4px;">✏️</button>`;
            }

            if (permissions.canDelete) {
                 actions += `<button class="btn-icon btn-delete" data-id="${r.id}" title="Eliminar" style="background:#dc3545; color:white; border:none; padding:5px; border-radius:4px; cursor:pointer;">🗑️</button>`;
            }
            
            actions = `<div class="action-buttons" style="display:flex; align-items:center;">${actions}</div>`;
            
            tr.innerHTML = `
                <td><strong>${r.plate || 'N/A'}</strong></td>
                <td>${r.gender}</td>
                <td>${months}</td>
                <td>
                    ${r.name || '-'}<br>
                    <small class="text-muted">${r.strain || ''}</small>
                </td>
                <td><span class="status-badge ${r.status?.toLowerCase()}">${r.status || 'Desconocido'}</span></td>
                <td>${r.price ? `$${r.price}` : '-'}</td>
                <td>${actions}</td>
            `;
            tbody.appendChild(tr);
        });

        // 3. Initialize DataTable
        $(selector).DataTable({
            language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' },
            responsive: true,
            order: [[2, 'asc']],
            columnDefs: [{ targets: 2, type: 'num' }, { orderable: false, targets: 6 }] 
        });
    }

    // D3.js Genealogy Tree
    static renderPedigreeTree(roosterData, containerSelector) {
        const container = document.querySelector(containerSelector);
        if(!container) return;
        container.innerHTML = ''; // Clear previous

        if (!window.d3) {
            container.innerHTML = '<p class="text-danger">Error: Librería D3.js no cargada.</p>';
            return;
        }

        // 1. Transform Data to Hierarchy
        const buildNode = (r, role) => ({
            name: r ? r.name : 'Sin registro', // Explicit null handling
            plate: r ? r.plate : null,
            role: role,
            children: [],
            exists: !!r // Flag to know if it's a real record
        });

        const root = buildNode(roosterData, 'Ave');
        
        // Parents
        if (roosterData.father) {
            const fatherNode = buildNode(roosterData.father, 'Padre');
            root.children.push(fatherNode);
            // Grandparents (Father's side)
            fatherNode.children.push(buildNode(roosterData.father.father, 'Abuelo Paterno'));
            fatherNode.children.push(buildNode(roosterData.father.mother, 'Abuela Paterna'));
        } else {
            root.children.push(buildNode(null, 'Padre'));
        }
        
        if (roosterData.mother) {
            const motherNode = buildNode(roosterData.mother, 'Madre');
            root.children.push(motherNode);
             // Grandparents (Mother's side)
            motherNode.children.push(buildNode(roosterData.mother.father, 'Abuelo Materno'));
            motherNode.children.push(buildNode(roosterData.mother.mother, 'Abuela Materna'));
        } else {
             root.children.push(buildNode(null, 'Madre'));
        }

        // 2. D3 Layout
        const width = 800;
        const height = 400;
        const margin = { top: 20, right: 90, bottom: 30, left: 90 };

        const svg = d3.select(containerSelector).append("svg")
            .attr("width", "100%")
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const treemap = d3.tree().size([height - 50, width - 200]);
        let nodes = d3.hierarchy(root, d => d.children);
        nodes = treemap(nodes);

        // Links
        svg.selectAll(".link")
            .data(nodes.descendants().slice(1))
            .enter().append("path")
            .attr("class", "link")
            .style("stroke", "#ccc")
            .style("stroke-width", "2px")
            .style("fill", "none")
            .attr("d", d => {
                return "M" + d.y + "," + d.x
                    + "C" + (d.y + d.parent.y) / 2 + "," + d.x
                    + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
                    + " " + d.parent.y + "," + d.parent.x;
            });

        // Nodes
        const node = svg.selectAll(".node")
            .data(nodes.descendants())
            .enter().append("g")
            .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
            .attr("transform", d => "translate(" + d.y + "," + d.x + ")")
            .style("cursor", d => d.data.exists ? "pointer" : "default")
            .on("click", (event, d) => {
                if (d.data.exists && d.data.plate) {
                    // Redirect to inventory with search
                    window.location.href = `inventory.html?search=${encodeURIComponent(d.data.plate)}`;
                }
            });

        // Circle
        node.append("circle")
            .attr("r", 10)
            .style("fill", d => d.data.exists ? "#fff" : "#eee") // Grey out empty nodes
            .style("stroke", d => d.data.exists ? "steelblue" : "#ccc")
            .style("stroke-width", "3px");

        // Text
        node.append("text")
            .attr("dy", ".35em")
            .attr("x", d => d.children ? -13 : 13)
            .style("text-anchor", d => d.children ? "end" : "start")
            .text(d => d.data.name)
            .style("font-size", "14px")
            .style("font-weight", d => d.depth === 0 ? "bold" : "normal")
            .style("fill", d => d.data.exists ? "black" : "#aaa");
            
        // Role Label
        node.append("text")
            .attr("dy", "1.5em")
            .attr("x", d => d.children ? -13 : 13)
            .style("text-anchor", d => d.children ? "end" : "start")
            .text(d => d.data.role)
            .style("font-size", "10px")
            .style("fill", "#666");
    }

    static calculateAgeInMonths(birthDateString) {
        if (!birthDateString) return 0;
        // Handle YYYY-MM-DD from Supabase or DD/MM/YYYY
        let birthDate;
        if(birthDateString.includes('-')) {
             // Append T00:00:00 to avoid timezone issues shifting the day
             birthDate = new Date(birthDateString + 'T00:00:00');
        } else {
            const [day, month, year] = birthDateString.split('/');
            birthDate = new Date(year, month - 1, day);
        }
        
        const today = new Date();
        let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
        months -= birthDate.getMonth();
        months += today.getMonth();
        return months <= 0 ? 0 : months;
    }
}
