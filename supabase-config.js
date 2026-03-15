// supabase-config.js
const SUPABASE_URL = 'https://mbrlhpqbjypdrgsjqycs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icmxocHFianlwZHJnc2pxeWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NDU1MDYsImV4cCI6MjA4OTEyMTUwNn0.C5plEF0kwXqkGBqq_iSO0XLFdMPkrI9DEXbXCAQ8YCA';

// Inicializar cliente de Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Funciones de autenticación
const auth = {
    // Registrar nuevo usuario
    async signUp(email, password, userData) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        });
        
        if (error) throw error;
        
        // Crear perfil en la tabla profiles
        if (data.user) {
            await this.createProfile(data.user.id, {
                email,
                ...userData
            });
        }
        
        return data;
    },
    
    // Iniciar sesión
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        return data;
    },
    
    // Cerrar sesión
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },
    
    // Obtener usuario actual
    getCurrentUser() {
        return supabase.auth.getUser();
    },
    
    // Crear perfil de usuario
    async createProfile(userId, profileData) {
        const { error } = await supabase
            .from('profiles')
            .insert([{
                id: userId,
                email: profileData.email,
                first_name: profileData.first_name,
                last_name: profileData.last_name,
                date_of_birth: profileData.date_of_birth,
                gender: profileData.gender,
                height: profileData.height,
                weight: profileData.weight,
                fitness_level: profileData.fitness_level,
                goals: profileData.goals || []
            }]);
            
        if (error) throw error;
    },
    
    // Obtener perfil de usuario
    async getProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (error) throw error;
        return data;
    },
    
    // Actualizar perfil
    async updateProfile(userId, updates) {
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);
            
        if (error) throw error;
    }
};

// Funciones para rutinas
const routines = {
    // Crear rutina
    async create(routineData) {
        const user = await supabase.auth.getUser();
        if (!user.data.user) throw new Error('Usuario no autenticado');
        
        const { data, error } = await supabase
            .from('routines')
            .insert([{
                user_id: user.data.user.id,
                ...routineData
            }])
            .select()
            .single();
            
        if (error) throw error;
        return data;
    },
    
    // Obtener rutinas del usuario
    async getUserRoutines() {
        const user = await supabase.auth.getUser();
        if (!user.data.user) throw new Error('Usuario no autenticado');
        
        const { data, error } = await supabase
            .from('routines')
            .select('*')
            .eq('user_id', user.data.user.id)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return data;
    },
    
    // Obtener rutina con ejercicios
    async getRoutineWithExercises(routineId) {
        const { data, error } = await supabase
            .from('routines')
            .select(`
                *,
                routine_exercises (
                    id,
                    exercise_id,
                    sets,
                    reps,
                    weight,
                    notes,
                    "order"
                )
            `)
            .eq('id', routineId)
            .single();
            
        if (error) throw error;
        return data;
    },
    
    // Agregar ejercicio a rutina
    async addExercise(routineId, exerciseData) {
        const { data, error } = await supabase
            .from('routine_exercises')
            .insert([{
                routine_id: routineId,
                ...exerciseData
            }])
            .select();
            
        if (error) throw error;
        return data;
    },
    
    // Actualizar ejercicio en rutina
    async updateExercise(exerciseId, updates) {
        const { error } = await supabase
            .from('routine_exercises')
            .update(updates)
            .eq('id', exerciseId);
            
        if (error) throw error;
    },
    
    // Eliminar ejercicio de rutina
    async removeExercise(exerciseId) {
        const { error } = await supabase
            .from('routine_exercises')
            .delete()
            .eq('id', exerciseId);
            
        if (error) throw error;
    },
    
    // Eliminar rutina
    async delete(routineId) {
        const { error } = await supabase
            .from('routines')
            .delete()
            .eq('id', routineId);
            
        if (error) throw error;
    }
};

// Funciones para progreso
const progress = {
    // Registrar progreso
    async add(progressData) {
        const user = await supabase.auth.getUser();
        if (!user.data.user) throw new Error('Usuario no autenticado');
        
        const { data, error } = await supabase
            .from('progress')
            .insert([{
                user_id: user.data.user.id,
                ...progressData
            }])
            .select()
            .single();
            
        if (error) throw error;
        return data;
    },
    
    // Obtener progreso del usuario
    async getUserProgress(limit = 30) {
        const user = await supabase.auth.getUser();
        if (!user.data.user) throw new Error('Usuario no autenticado');
        
        const { data, error } = await supabase
            .from('progress')
            .select('*')
            .eq('user_id', user.data.user.id)
            .order('date', { ascending: false })
            .limit(limit);
            
        if (error) throw error;
        return data;
    },
    
    // Obtener estadísticas
    async getStats() {
        const user = await supabase.auth.getUser();
        if (!user.data.user) throw new Error('Usuario no autenticado');
        
        const { data, error } = await supabase
            .from('progress')
            .select('*')
            .eq('user_id', user.data.user.id)
            .order('date', { ascending: false });
            
        if (error) throw error;
        
        // Calcular estadísticas
        const stats = {
            totalCalories: 0,
            totalWorkouts: data.length,
            avgDuration: 0,
            streak: 0
        };
        
        if (data.length > 0) {
            stats.totalCalories = data.reduce((sum, entry) => sum + (entry.calories_burned || 0), 0);
            stats.avgDuration = Math.round(data.reduce((sum, entry) => sum + (entry.workout_duration || 0), 0) / data.length);
            
            // Calcular racha (simplificado)
            let currentStreak = 1;
            for (let i = 1; i < data.length; i++) {
                const prevDate = new Date(data[i-1].date);
                const currDate = new Date(data[i].date);
                const diffDays = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    currentStreak++;
                } else {
                    break;
                }
            }
            stats.streak = currentStreak;
        }
        
        return stats;
    }
};

// Funciones para ejercicios (ExerciseDB)
const exercises = {
    API_KEY: '8e13869146msh04e6fa201e07a2bp1f8156jsn5fcf0546b814',
    API_HOST: 'exercisedb.p.rapidapi.com',
    BASE_URL: 'https://exercisedb.p.rapidapi.com',
    
    async fetchAll() {
        const response = await axios.get(`${this.BASE_URL}/exercises`, {
            headers: {
                'X-RapidAPI-Key': this.API_KEY,
                'X-RapidAPI-Host': this.API_HOST
            }
        });
        return response.data;
    },
    
    async fetchByBodyPart(bodyPart) {
        const response = await axios.get(`${this.BASE_URL}/exercises/bodyPart/${bodyPart}`, {
            headers: {
                'X-RapidAPI-Key': this.API_KEY,
                'X-RapidAPI-Host': this.API_HOST
            }
        });
        return response.data;
    },
    
    async fetchById(id) {
        const response = await axios.get(`${this.BASE_URL}/exercises/exercise/${id}`, {
            headers: {
                'X-RapidAPI-Key': this.API_KEY,
                'X-RapidAPI-Host': this.API_HOST
            }
        });
        return response.data;
    },
    
    async getBodyParts() {
        const response = await axios.get(`${this.BASE_URL}/exercises/bodyPartList`, {
            headers: {
                'X-RapidAPI-Key': this.API_KEY,
                'X-RapidAPI-Host': this.API_HOST
            }
        });
        return response.data;
    },
    
    async getEquipment() {
        const response = await axios.get(`${this.BASE_URL}/exercises/equipmentList`, {
            headers: {
                'X-RapidAPI-Key': this.API_KEY,
                'X-RapidAPI-Host': this.API_HOST
            }
        });
        return response.data;
    }
};

// Exportar funciones
window.fitgenius = {
    supabase,
    auth,
    routines,
    progress,
    exercises
};