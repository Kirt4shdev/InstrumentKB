import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const exportRouter = Router();

// GET export all data as JSON
exportRouter.get('/json', async (req: Request, res: Response) => {
  try {
    const [
      articles,
      manufacturers,
      instruments,
      variables,
      documents,
      images,
      instrumentVariables,
      analogOutputs,
      digitalIO,
      protocols,
      modbusRegisters,
      sdi12Commands,
      nmeaSentences,
      tags,
      provenance
    ] = await Promise.all([
      prisma.article.findMany(),
      prisma.manufacturer.findMany(),
      prisma.instrument.findMany(),
      prisma.variableDict.findMany(),
      prisma.document.findMany(),
      prisma.image.findMany(),
      prisma.instrumentVariable.findMany(),
      prisma.analogOutput.findMany(),
      prisma.digitalIO.findMany(),
      prisma.instrumentProtocol.findMany(),
      prisma.modbusRegister.findMany(),
      prisma.sDI12Command.findMany(),
      prisma.nMEASentence.findMany(),
      prisma.tag.findMany(),
      prisma.provenance.findMany()
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      version: '2.0',
      sap_integration: true,
      data: {
        articles,
        manufacturers,
        instruments,
        variables,
        documents,
        images,
        instrumentVariables,
        analogOutputs,
        digitalIO,
        protocols,
        modbusRegisters,
        sdi12Commands,
        nmeaSentences,
        tags,
        provenance
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="instrumentkb-export-${Date.now()}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Error exporting data' });
  }
});

// GET export single instrument as JSON
exportRouter.get('/json/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const instrument = await prisma.instrument.findUnique({
      where: { instrument_id: id },
      include: {
        article: true,
        manufacturer: true,
        documents: true,
        images: true,
        instrument_variables: {
          include: {
            variable: true
          }
        },
        analog_outputs: true,
        digital_io: true,
        instrument_protocols: true,
        modbus_registers: true,
        sdi12_commands: true,
        nmea_sentences: true,
        tags: true,
        provenance: true
      }
    });

    if (!instrument) {
      return res.status(404).json({ error: 'Instrument not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="instrument-${id}-${Date.now()}.json"`);
    res.json(instrument);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Error exporting instrument' });
  }
});

// GET export as SQL dump
exportRouter.get('/sql', async (req: Request, res: Response) => {
  try {
    // Obtener todos los datos
    const [
      articles,
      manufacturers,
      instruments,
      variables,
      documents,
      images,
      instrumentVariables,
      analogOutputs,
      digitalIO,
      protocols,
      modbusRegisters,
      sdi12Commands,
      nmeaSentences,
      tags,
      provenance
    ] = await Promise.all([
      prisma.article.findMany(),
      prisma.manufacturer.findMany(),
      prisma.instrument.findMany(),
      prisma.variableDict.findMany(),
      prisma.document.findMany(),
      prisma.image.findMany(),
      prisma.instrumentVariable.findMany(),
      prisma.analogOutput.findMany(),
      prisma.digitalIO.findMany(),
      prisma.instrumentProtocol.findMany(),
      prisma.modbusRegister.findMany(),
      prisma.sDI12Command.findMany(),
      prisma.nMEASentence.findMany(),
      prisma.tag.findMany(),
      prisma.provenance.findMany()
    ]);

    // Generar SQL INSERT statements
    let sql = `-- InstrumentKB SQL Export (with SAP Integration)
-- Generated at: ${new Date().toISOString()}
-- Version: 2.0
-- 

`;

    // Helper para escapar valores SQL
    const escapeSQLValue = (value: any): string => {
      if (value === null || value === undefined) return 'NULL';
      if (typeof value === 'number') return value.toString();
      if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
      if (value instanceof Date) return `'${value.toISOString()}'`;
      return `'${value.toString().replace(/'/g, "''")}'`;
    };

    // Articles (PRIMERO - es el nexo con SAP)
    if (articles.length > 0) {
      sql += '\n-- Articles (SAP Integration)\n';
      articles.forEach(a => {
        sql += `INSERT INTO articles (article_id, sap_itemcode, sap_description, family, subfamily, internal_notes, active, created_at, updated_at) VALUES (${escapeSQLValue(a.article_id)}, ${escapeSQLValue(a.sap_itemcode)}, ${escapeSQLValue(a.sap_description)}, ${escapeSQLValue(a.family)}, ${escapeSQLValue(a.subfamily)}, ${escapeSQLValue(a.internal_notes)}, ${escapeSQLValue(a.active)}, ${escapeSQLValue(a.created_at)}, ${escapeSQLValue(a.updated_at)});\n`;
      });
    }

    // Manufacturers
    if (manufacturers.length > 0) {
      sql += '\n-- Manufacturers\n';
      manufacturers.forEach(m => {
        sql += `INSERT INTO manufacturers (manufacturer_id, name, country, website, support_email, notes) VALUES (${m.manufacturer_id}, ${escapeSQLValue(m.name)}, ${escapeSQLValue(m.country)}, ${escapeSQLValue(m.website)}, ${escapeSQLValue(m.support_email)}, ${escapeSQLValue(m.notes)});\n`;
      });
    }

    // Variables
    if (variables.length > 0) {
      sql += '\n-- Variables Dictionary\n';
      variables.forEach(v => {
        sql += `INSERT INTO variables_dict (variable_id, name, unit_default, description) VALUES (${v.variable_id}, ${escapeSQLValue(v.name)}, ${escapeSQLValue(v.unit_default)}, ${escapeSQLValue(v.description)});\n`;
      });
    }

    // Instruments
    if (instruments.length > 0) {
      sql += '\n-- Instruments\n';
      instruments.forEach(i => {
        const fields = Object.keys(i).join(', ');
        const values = Object.values(i).map(escapeSQLValue).join(', ');
        sql += `INSERT INTO instruments (${fields}) VALUES (${values});\n`;
      });
    }

    // Documents
    if (documents.length > 0) {
      sql += '\n-- Documents\n';
      documents.forEach(d => {
        const fields = Object.keys(d).join(', ');
        const values = Object.values(d).map(escapeSQLValue).join(', ');
        sql += `INSERT INTO documents (${fields}) VALUES (${values});\n`;
      });
    }

    // Images
    if (images.length > 0) {
      sql += '\n-- Images\n';
      images.forEach(i => {
        const fields = Object.keys(i).join(', ');
        const values = Object.values(i).map(escapeSQLValue).join(', ');
        sql += `INSERT INTO images (${fields}) VALUES (${values});\n`;
      });
    }

    // Instrument Variables
    if (instrumentVariables.length > 0) {
      sql += '\n-- Instrument Variables\n';
      instrumentVariables.forEach(iv => {
        const fields = Object.keys(iv).join(', ');
        const values = Object.values(iv).map(escapeSQLValue).join(', ');
        sql += `INSERT INTO instrument_variables (${fields}) VALUES (${values});\n`;
      });
    }

    // Analog Outputs
    if (analogOutputs.length > 0) {
      sql += '\n-- Analog Outputs\n';
      analogOutputs.forEach(ao => {
        const fields = Object.keys(ao).join(', ');
        const values = Object.values(ao).map(escapeSQLValue).join(', ');
        sql += `INSERT INTO analog_outputs (${fields}) VALUES (${values});\n`;
      });
    }

    // Digital I/O
    if (digitalIO.length > 0) {
      sql += '\n-- Digital I/O\n';
      digitalIO.forEach(dio => {
        const fields = Object.keys(dio).join(', ');
        const values = Object.values(dio).map(escapeSQLValue).join(', ');
        sql += `INSERT INTO digital_io (${fields}) VALUES (${values});\n`;
      });
    }

    // Protocols
    if (protocols.length > 0) {
      sql += '\n-- Instrument Protocols\n';
      protocols.forEach(p => {
        const fields = Object.keys(p).join(', ');
        const values = Object.values(p).map(escapeSQLValue).join(', ');
        sql += `INSERT INTO instrument_protocols (${fields}) VALUES (${values});\n`;
      });
    }

    // Modbus Registers
    if (modbusRegisters.length > 0) {
      sql += '\n-- Modbus Registers\n';
      modbusRegisters.forEach(mr => {
        const fields = Object.keys(mr).join(', ');
        const values = Object.values(mr).map(escapeSQLValue).join(', ');
        sql += `INSERT INTO modbus_registers (${fields}) VALUES (${values});\n`;
      });
    }

    // SDI-12 Commands
    if (sdi12Commands.length > 0) {
      sql += '\n-- SDI-12 Commands\n';
      sdi12Commands.forEach(sdi => {
        const fields = Object.keys(sdi).join(', ');
        const values = Object.values(sdi).map(escapeSQLValue).join(', ');
        sql += `INSERT INTO sdi12_commands (${fields}) VALUES (${values});\n`;
      });
    }

    // NMEA Sentences
    if (nmeaSentences.length > 0) {
      sql += '\n-- NMEA Sentences\n';
      nmeaSentences.forEach(nmea => {
        const fields = Object.keys(nmea).join(', ');
        const values = Object.values(nmea).map(escapeSQLValue).join(', ');
        sql += `INSERT INTO nmea_sentences (${fields}) VALUES (${values});\n`;
      });
    }

    // Tags
    if (tags.length > 0) {
      sql += '\n-- Tags\n';
      tags.forEach(t => {
        sql += `INSERT INTO tags (tag_id, instrument_id, tag) VALUES (${t.tag_id}, ${t.instrument_id}, ${escapeSQLValue(t.tag)});\n`;
      });
    }

    // Provenance
    if (provenance.length > 0) {
      sql += '\n-- Provenance\n';
      provenance.forEach(p => {
        const fields = Object.keys(p).join(', ');
        const values = Object.values(p).map(escapeSQLValue).join(', ');
        sql += `INSERT INTO provenance (${fields}) VALUES (${values});\n`;
      });
    }

    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename="instrumentkb-export-${Date.now()}.sql"`);
    res.send(sql);
  } catch (error) {
    console.error('SQL export error:', error);
    res.status(500).json({ error: 'Error exporting SQL' });
  }
});

