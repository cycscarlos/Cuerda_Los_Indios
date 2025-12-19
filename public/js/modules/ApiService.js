import { supabase } from '../supabaseClient.js';

/**
 * Service to handle data fetching via Supabase
 */
export default class ApiService {
    constructor() {
        // No base URL needed for Supabase
    }

    async getRoosters() {
        try {
            const { data, error } = await supabase
                .from('roosters')
                .select(`
                    *,
                    father:father_id(name),
                    mother:mother_id(name)
                `)
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            // Map Supabase response to match expected frontend structure
            return data.map(r => ({
                ...r,
                genealogy: {
                    fatherName: r.father?.name || 'Desconocido',
                    motherName: r.mother?.name || 'Desconocida',
                    fatherId: r.father_id,
                    motherId: r.mother_id
                }
            }));

        } catch (error) {
            console.error('Error fetching roosters from Supabase:', error);
            throw error;
        }
    }

    async getRoosterWithPedigree(id) {
        try {
            // Fetch rooster with Parents and Grandparents
            const { data, error } = await supabase
                .from('roosters')
                .select(`
                    *,
                    father:father_id(
                        name, 
                        father:father_id(name), 
                        mother:mother_id(name)
                    ),
                    mother:mother_id(
                        name, 
                        father:father_id(name), 
                        mother:mother_id(name)
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching pedigree:', error);
            throw error;
        }
    }

    async createRooster(roosterData) {
        const { error } = await supabase
            .from('roosters')
            .insert([roosterData]);
        if (error) throw error;
    }

    async updateRooster(id, updates) {
        const { error } = await supabase
            .from('roosters')
            .update(updates)
            .eq('id', id);
        if (error) throw error;
    }

    async deleteRooster(id) {
        // Soft Delete
        const { error } = await supabase
            .from('roosters')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;
    }

    async createSale(customerData, cartItems) {
        // 1. Create or Find Customer
        // For simplicity, we insert new customer or retrieve by ID if we had logic. 
        // Here we just insert/upsert based on doc_id? 
        // Let's just insert for now to satisfy requirement.
        
        let customerId;
        
        // Check if exists by doc_id
        if (customerData.doc_id) {
            const { data: existing } = await supabase
                .from('customers')
                .select('id')
                .eq('doc_id', customerData.doc_id)
                .single();
            
            if (existing) {
                customerId = existing.id;
            } else {
                const { data: newCust, error: custError } = await supabase
                    .from('customers')
                    .insert([customerData])
                    .select()
                    .single();
                if (custError) throw custError;
                customerId = newCust.id;
            }
        }

        // 2. Create Sale Header
        const total = cartItems.reduce((sum, item) => sum + (Number(item.priceAtAdd) || 0), 0);
        const { data: sale, error: saleError } = await supabase
            .from('sales')
            .insert([{
                customer_id: customerId,
                total_amount: total,
                status: 'Confirmada' // Or 'Pendiente'
            }])
            .select()
            .single();

        if (saleError) throw saleError;

        // 3. Create Sale Details
        const details = cartItems.map(item => ({
            sale_id: sale.id,
            rooster_id: item.id,
            unit_price: item.priceAtAdd
        }));

        const { error: detailsError } = await supabase
            .from('sale_details')
            .insert(details);
            
        if (detailsError) throw detailsError;

        // 4. Update Rooster Status to 'Vendido'
        const roosterIds = cartItems.map(i => i.id);
        const { error: updateError } = await supabase
            .from('roosters')
            .update({ status: 'Vendido' })
            .in('id', roosterIds);

        if (updateError) throw updateError;
    }
}
