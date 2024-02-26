// Nimrat Brar
// COMP 4513-001
// Assignment 1

const express = require('express');
const supa = require('@supabase/supabase-js');
const app = express();

const supaUrl = 'https://lrjynbunvzklcadunbdd.supabase.co';
const supaAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyanluYnVudnprbGNhZHVuYmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg1NjY0MjUsImV4cCI6MjAyNDE0MjQyNX0.ilDebObEzX3m-QrMku9f9KmocXUnbnxuQQaim_7Hgi0';

const supabase = supa.createClient(supaUrl, supaAnonKey);

app.listen(8080, () => {
 console.log(' Listening at localhost, port 8080')

   }); 

// This returns all the seasons for f1.
app.get('/api/seasons', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('seasons')
            .select();
        
       if (!data || data.length === 0) {
            res.json({ message: 'No seasons found' });
        } else {
            res.json(data);
        }
    } catch (error) {
        res.json({ error: 'Internal Server Error' });
    }
});

// This returns all the circuits
app.get('/api/circuits', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('circuits')
            .select();

      if (!data || data.length === 0) {
            res.json({ message: 'No circuits found' });
        } else {
            res.json(data);
        }
    } catch (error) {
        res.json({ error: 'Internal Server Error' });
    }
});

// Returns a specified circuit.
app.get('/api/circuits/ref/:circuitRef', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('circuits')
            .select('*')
            .eq('circuitRef', req.params.circuitRef);
        
      if (!data || data.length === 0) {
            res.json({ message: 'Circuit not found' });
        } else {
            res.json(data);
        }
    } catch (error) {
        res.json({ error: 'Internal Server Error' });
    }
});

// returns the circuits used in a given season( by ascending order)  
/*
app.get('/api/circuits/season/:year', async (req, res) => {
    try {
        const year = parseInt(req.params.year);
        const { data, error } = await supabase
            .from('races')
            .select('circuits(name, location, country)')
            .eq('year', year)
            .order('round', { ascending: true });
        
     if (!data || data.length === 0) {
            res.json({ message: 'No circuits found for the specified season' });
        } else {
            res.json(data);
        }
    } catch (error) {
        res.json({ error: 'Internal Server Error' });
    }
});
*/
app.get('/api/circuits/seasons/:year', async (req,res) =>
{
    try{
        const year = parseInt(req.params.year);
        const {data,error} = await supabase
        .from('circuits')
        .select('*, races!inner()')
        .eq('races.year',year)
     
        
        if (!data || data.length === 0) {
               res.json({ message: 'No circuits found for the specified season' });
           } else {
               res.json(data);
           }
       } catch (error) {
           res.json({ error: 'Internal Server Error' });
       }
    
})

// This returns all the constructors
app.get('/api/constructors', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('constructors')
            .select();
        
      if (!data || data.length === 0) {
            res.json({ message: 'No constructors found' });
        } else {
            res.json(data);
        }
    } catch (error) {
        res.json({ error: 'Internal Server Error' });
    }
});

// This returns a specific constructor
app.get('/api/constructors/:constructorRef', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('constructors')
            .select('*')
            .eq('constructorRef', req.params.constructorRef);
        
       if (!data || data.length === 0) {
            res.json({ message: 'Constructor not found' });
        } else {
            res.json(data);
        }
    } catch (error) {
        res.json({ error: 'Internal Server Error' });
    }
});

// This returns all the drivers
app.get('/api/drivers', async (req,res)=>
{
    try{
    const {data,error} = await supabase
    .from('drivers')
    .select();
   if(!data || data.length == 0)
    {
        res.json({message: ' No Drivers found'})
    }
    else
    {
        res.json(data);
    }
    }catch(error){
        res.json({ error: 'Internal Server Error'})
    }
})

// This returns a specific driver
app.get('/api/drivers/:driverRef', async(req,res) =>
{
    try{
        const {data,error} = await supabase
        .from('drivers')
        .select('*')
        .eq('driverRef',req.params.driverRef.toLowerCase())

      if(!data || data.length == 0)
        {
            res.json({message: 'Driver not found'})
        }
        else
        {
            res.json(data);
        }
    }catch(error)
    {
        res.json({ error: 'Internal Server Error'});
    }
})

// This returns drivers whose surname begins with a specified substring.
app.get('/api/drivers/search/:substring', async(req,res)=>
{
    try{
        const substring = req.params.substring.toLowerCase(); // handles case-insensitive
        const {data,error} = await supabase
        .from('drivers')
        .select('*')
        .ilike('surname', `${req.params.substring}%`);
        res.send(data);
        if(!data || data.length == 0)
        {
            res.json({message: 'Could not find driver whose surname begins with specified substring'})
        }
        else
        {
            res.json(data);
        }
    }catch(error)
    {
        res.json({ error: 'Internal Server Error'});
    }
})

// this returns the drivers within a given race
app.get('/api/drivers/race/:raceId', async (req, res) => {
    try {
        const raceId = req.params.raceId;

        // Retrieve the driverIds associated with the given raceId from the results table
        const { data: raceResults, error: raceResultsError } = await supabase
            .from('results')
            .select('driverId')
            .eq('raceId', raceId);


        if (!raceResults || raceResults.length === 0) {
            res.json({ message: 'No results found for the specified raceId' });
            return;
        }

        // Extract the driverIds from the raceResults
        const driverIds = raceResults.map(result => result.driverId);

        // Retrieve the driver details associated with the extracted driverIds from the drivers table
        const { data: drivers, error: driversError } = await supabase
            .from('drivers')
            .select()
            .in('driverId', driverIds);

     

        if (!drivers || drivers.length === 0) {
            res.json({ message: 'No drivers found for the specified raceId' });
            
        }
        else{
        res.json(drivers);
        }
    } catch (error) {
        res.json({ error: 'Internal Server Error' });
    }
});

//  This returns a specified race with circuit name
app.get('/api/races/:raceId', async (req,res) =>
{
    try{
    const {data,error} = await supabase
    .from('races')
    .select(`raceId, circuits(name, location, country )`)
    .eq('raceId',req.params.raceId );
    res.send(data)
    if(!data || data.length == 0)
    {
        res.json({message: 'Driver not found'})
    }
    else
    {
        res.json(data);
    }
    }catch(error)
    {
        res.json({ error: 'Internal Server Error'})
    }
})
// This returns the races within a given season ordered by round
app.get('/api/races/seasons/:year', async (req,res)=>
{
    try{
    const {data,error} = await supabase
    .from('races')
    .select(`*`)
    .eq('year',req.params.year)
    .order('round', {ascending: true});
    if(!data || data.length == 0)
    {
        res.json({message: 'Races not found'})
    }
    else
    {
        res.json(data);
    }
    }catch(error)
    {
        res.json({ error: 'Internal Server Error'})
    }
})
// This returns a specific race in a year based on round
app.get('/api/races/seasons/:year/:round', async (req,res)=>
{
    try{
    const {data,error} = await supabase
    .from('races')
    .select(`*`)
    .eq('year',req.params.year)
    .eq('round',req.params.round)
    if(!data || data.length == 0)
    {
        res.json({message: ' Race not found'})
    }
    else
    {
        res.json(data);
    }
    }catch(error)
    {
        res.json({ error: 'Internal Server Error'})
    }
})

// This returns all the races for a given circuit
app.get('/api/races/circuits/:circuitRef', async (req, res) => {
    try {
        // Retrieve circuitId based on the circuitRef
        const { data: circuitData, error: circuitError } = await supabase
            .from('circuits')
            .select('circuitId')
            .eq('circuitRef', req.params.circuitRef);


        // If circuit not found
        if (!circuitData || circuitData.length === 0) {
            res.json({ message: 'Circuit not found' });
            return;
        }

        const circuitId = circuitData[0].circuitId;

        // Retrieve races for the given circuitId ordered by year
        const { data: racesData, error: racesError } = await supabase
            .from('races')
            .select('*')
            .eq('circuitId', circuitId)
            .order('year', { ascending: true });


        // If no races found for the given circuitId
        if (!racesData || racesData.length === 0) {
            res.json({ message: 'No races found for the circuit' });
            return;
        }

        res.json(racesData);
    } catch (error) {
        res.json({ error: 'Internal Server Error' });
    }
});
// returns all the races for a given circuit between two years
app.get('/api/races/circuits/:circuitRef/season/:startYear/:endYear', async (req, res) => {
    try {
        const startYear = parseInt(req.params.startYear);
        const endYear = parseInt(req.params.endYear);

        // Check if end year is earlier than start year
        if (endYear < startYear) {
            res.json({ error: 'End year cannot be earlier than start year' });
            return;
        }

        // Retrieve circuitId based on the circuitRef
        const { data: circuitData, error: circuitError } = await supabase
            .from('circuits')
            .select('circuitId')
            .eq('circuitRef', req.params.circuitRef);

        if (circuitError) {
            res.json({ error: 'Internal Server Error' });
            return;
        }

        // If circuit not found
        if (!circuitData || circuitData.length === 0) {
            res.json({ message: 'Circuit not found' });
            return;
        }

        const circuitId = circuitData[0].circuitId;

        // Retrieve races for the given circuitId and between the provided years
        const { data: racesData, error: racesError } = await supabase
            .from('races')
            .select('*')
            .eq('circuitId', circuitId)
            .gte('year', startYear)
            .lte('year', endYear)
            .order('year', { ascending: true });

        if (racesError) {
            res.json({ error: 'Internal Server Error' });
            return;
        }

        res.json(racesData);
    } catch (error) {
        res.json({ error: 'Internal Server Error' });
    }
});

// This returns the results for the specified race

app.get('/api/results/:raceId', async(req,res)=>
{
    try{
        const {data, error} = await supabase
        .from('results')
        .select(`drivers(driverRef,code,forename,surname), races(name,round,year,date), constructors(name,constructorRef,nationality)`)
        .eq('raceId', req.params.raceId)
        .order('grid', {ascending: true})
        if(!data || data.length == 0)
        {
            res.json({message: ' Race results not found'})
        }
        else
        {
            res.json(data);
        }

    }catch(error)
    {
        res.json({ error: 'Internal Server Error' });
    }


})

// This returns all the results of a given driver
app.get('/api/results/driver/:driverRef', async(req,res) =>
{
    try{
        const {data,error} = await supabase
        .from('results')
        .select('*, drivers!inner()')
        .eq('drivers.driverRef', req.params.driverRef);
        if(!data || data.length == 0)
        {
            res.json({message: ' Results for driver not found'})
        }
        else
        {
            res.json(data);
        }

    }catch(error){

        res.json({ error: 'Internal Server Error' });
    
    }
})

// This returns all the results for a given driver between two years
app.get('/api/results/drivers/:driverRef/seasons/:startYear/:endYear', async (req,res)=>
{
    try{
    const startYear = parseInt(req.params.startYear);
    const endYear = parseInt(req.params.endYear);

        // Check if end year is earlier than start year
        if (endYear < startYear) {
            res.json({ error: 'End year cannot be earlier than start year' });
            return;
        }
        const {data,error} = await supabase
        .from('results')
        .select('*, drivers!inner(),races!inner()')
        .eq('drivers.driverRef',req.params.driverRef)
        .gte('races.year', req.params.startYear)
        .lte('races.year', req.params.endYear)
        if(!data || data.length == 0)
        {
            res.json({message: ' Results for driver not found'})
        }
        else
        {
            res.json(data);
        }
    }catch(error)
    {

        res.json({ error: 'Internal Server Error' });
    }
})

// This returns the qualifying results for the specified race
app.get('/api/qualifying/:raceId', async(req,res)=>
{
    try{
    const {data,error} = await supabase
    .from('qualifying')
    .select('*, drivers(driverRef, code, forename, surname), races(name,round,year,date), constructors(name, constructorRef, nationality) ')
    .eq('raceId', req.params.raceId)
    .order('position', {ascending: true});

    if(!data || data.length == 0)
        {
            res.json({message: ' Qualifying results not found'})
        }
        else
        {
            res.json(data);
        }
    }catch(error)
    {
        res.json({ error: 'Internal Server Error' });
    }
})

// this returns the current seasons driver standings table for the specified race
app.get('/api/standings/:raceId/drivers', async (req,res)=>
{
    try{

        const {data,error} = await supabase
        .from('driverStandings')
        .select('*')
        .eq('raceId', req.params.raceId)
        .order('position', {ascending: true})
        if(!data || data.length == 0)
        {
            res.json({message: ' Driver standings results not found'})
        }
        else
        {
            res.json(data);
        }

    }catch(error)
    {
        res.json({ error: 'Internal Server Error' });
    }
    
})
// This returns the current seasons constructors standings table for the specified race
app.get('/api/standings/:raceId/constructors', async (req,res)=>
{
    try{

        const {data,error} = await supabase
        .from('constructorStandings')
        .select('*')
        .eq('raceId', req.params.raceId)
        .order('position', {ascending: true})
        if(!data || data.length == 0)
        {
            res.json({message: ' Driver standings results not found'})
        }
        else
        {
            res.json(data);
        }

    }catch(error)
    {
        res.json({ error: 'Internal Server Error' });
    }
    
})
