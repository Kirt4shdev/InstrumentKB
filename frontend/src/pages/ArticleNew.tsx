import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Paper,
  TextInput,
  Select,
  Textarea,
  Button,
  Group,
  Stack,
  Grid,
  NumberInput,
  Switch,
  Notification,
  Tabs,
  Table,
  ActionIcon,
  Modal,
  Text,
  Badge,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import { JsonView, allExpanded, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import { 
  getArticleTypes, 
  getManufacturers, 
  getVariables,
  createArticle 
} from '../api';
import { ArticleTypeOption } from '../types';

function ArticleNew() {
  const navigate = useNavigate();
  const [articleTypes, setArticleTypes] = useState<ArticleTypeOption[]>([]);
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [variables, setVariables] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('basic');

  // Estados para las listas dinámicas
  const [articleVariables, setArticleVariables] = useState<any[]>([]);
  const [articleProtocols, setArticleProtocols] = useState<any[]>([]);
  const [analogOutputs, setAnalogOutputs] = useState<any[]>([]);
  const [digitalIO, setDigitalIO] = useState<any[]>([]);
  const [modbusRegisters, setModbusRegisters] = useState<any[]>([]);
  const [sdi12Commands, setSdi12Commands] = useState<any[]>([]);
  const [nmeaSentences, setNmeaSentences] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const form = useForm({
    initialValues: {
      sap_itemcode: '',
      sap_description: '',
      article_type: '',
      category: '',
      family: '',
      subfamily: '',
      manufacturer_id: '',
      model: '',
      variant: '',
      
      // Campos técnicos
      power_supply_min_v: '',
      power_supply_max_v: '',
      power_consumption_typ_w: '',
      current_max_a: '',
      voltage_rating_v: '',
      
      // Físicos
      ip_rating: '',
      dimensions_mm: '',
      weight_g: '',
      length_m: '',
      diameter_mm: '',
      material: '',
      color: '',
      
      // Ambientales
      oper_temp_min_c: '',
      oper_temp_max_c: '',
      storage_temp_min_c: '',
      storage_temp_max_c: '',
      oper_humidity_min_pct: '',
      oper_humidity_max_pct: '',
      altitude_max_m: '',
      
      // Certificaciones
      emc_compliance: '',
      certifications: '',
      
      // Ciclo de vida
      first_release_year: '',
      last_revision_year: '',
      
      // Gestión
      internal_notes: '',
      active: true,
    },
    validate: {
      sap_description: (value) => (!value ? 'La descripción SAP es obligatoria' : null),
      article_type: (value) => (!value ? 'El tipo de artículo es obligatorio' : null),
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [typesRes, manufacturersRes, variablesRes] = await Promise.all([
        getArticleTypes(),
        getManufacturers(),
        getVariables(),
      ]);
      setArticleTypes(typesRes.data);
      setManufacturers(manufacturersRes.data);
      setVariables(variablesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      setError(null);
      
      // Preparar datos
      const data: any = { ...values };
      
      // Limpiar valores vacíos
      Object.keys(data).forEach(key => {
        if (data[key] === '' || data[key] === null) {
          delete data[key];
        }
      });
      
      // Convertir IDs numéricos
      if (data.manufacturer_id) {
        data.manufacturer_id = parseInt(data.manufacturer_id);
      }
      
      // Agregar relaciones
      if (articleVariables.length > 0) {
        data.article_variables = articleVariables;
      }
      if (articleProtocols.length > 0) {
        data.article_protocols = articleProtocols;
      }
      if (analogOutputs.length > 0) {
        data.analog_outputs = analogOutputs;
      }
      if (digitalIO.length > 0) {
        data.digital_io = digitalIO;
      }
      if (modbusRegisters.length > 0) {
        data.modbus_registers = modbusRegisters;
      }
      if (sdi12Commands.length > 0) {
        data.sdi12_commands = sdi12Commands;
      }
      if (nmeaSentences.length > 0) {
        data.nmea_sentences = nmeaSentences;
      }
      if (documents.length > 0) {
        data.documents = documents;
      }
      if (images.length > 0) {
        data.images = images;
      }
      if (tags.length > 0) {
        data.tags = tags;
      }
      
      await createArticle(data);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error: any) {
      console.error('Error creating article:', error);
      setError(error.response?.data?.error || 'Error al crear el artículo');
    } finally {
      setLoading(false);
    }
  };

  // Funciones para agregar elementos
  const addVariable = () => {
    setArticleVariables([...articleVariables, {
      variable_id: '',
      range_min: '',
      range_max: '',
      unit: '',
      accuracy_abs: '',
      resolution: '',
      update_rate_hz: '',
      notes: ''
    }]);
  };

  const addProtocol = () => {
    setArticleProtocols([...articleProtocols, {
      type: 'ModbusRTU',
      physical_layer: '',
      port_label: '',
      baudrate: 9600,
      databits: 8,
      parity: 'N',
      stopbits: 1,
      notes: ''
    }]);
  };

  const addAnalogOutput = () => {
    setAnalogOutputs([...analogOutputs, {
      type: 'Current_4_20mA',
      num_channels: 1,
      range_min: '',
      range_max: '',
      unit: '',
      notes: ''
    }]);
  };

  const addDigitalIO = () => {
    setDigitalIO([...digitalIO, {
      direction: 'input',
      signal_type: 'TTL',
      voltage_level: '',
      notes: ''
    }]);
  };

  const addModbusRegister = () => {
    setModbusRegisters([...modbusRegisters, {
      function_code: 3,
      address: '',
      name: '',
      description: '',
      datatype: 'INT16',
      rw: 'R',
      unit: '',
      notes: ''
    }]);
  };

  const addSDI12Command = () => {
    setSdi12Commands([...sdi12Commands, {
      command: '',
      description: '',
      response_format: ''
    }]);
  };

  const addNMEASentence = () => {
    setNmeaSentences([...nmeaSentences, {
      sentence: '',
      description: '',
      fields: ''
    }]);
  };

  const addDocument = () => {
    setDocuments([...documents, {
      type: 'datasheet',
      title: '',
      language: '',
      url_or_path: ''
    }]);
  };

  const addImage = () => {
    setImages([...images, {
      caption: '',
      url_or_path: ''
    }]);
  };

  const addTag = () => {
    if (newTag.trim()) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // Funciones para eliminar elementos
  const removeItem = (list: any[], setList: Function, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  const updateItem = (list: any[], setList: Function, index: number, field: string, value: any) => {
    const newList = [...list];
    newList[index][field] = value;
    setList(newList);
  };

  // Generar preview JSON (solo campos con datos)
  const getPreviewObject = () => {
    const preview: any = {};
    
    // Copiar solo campos con valores
    Object.keys(form.values).forEach(key => {
      const value = form.values[key];
      if (value !== '' && value !== null && value !== undefined) {
        preview[key] = value;
      }
    });
    
    // Agregar relaciones solo si tienen datos
    if (articleVariables.length > 0) preview.article_variables = articleVariables;
    if (articleProtocols.length > 0) preview.article_protocols = articleProtocols;
    if (analogOutputs.length > 0) preview.analog_outputs = analogOutputs;
    if (digitalIO.length > 0) preview.digital_io = digitalIO;
    if (modbusRegisters.length > 0) preview.modbus_registers = modbusRegisters;
    if (sdi12Commands.length > 0) preview.sdi12_commands = sdi12Commands;
    if (nmeaSentences.length > 0) preview.nmea_sentences = nmeaSentences;
    if (documents.length > 0) preview.documents = documents;
    if (images.length > 0) preview.images = images;
    if (tags.length > 0) preview.tags = tags;
    
    return preview;
  };

  const selectedType = form.values.article_type;
  const showAdvancedFields = ['INSTRUMENTO', 'SENSOR', 'DATALOGGER', 'ACTUADOR', 'MODULO_IO', 'GATEWAY'].includes(selectedType);

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2}>➕ Nuevo Artículo</Title>
          <Button variant="subtle" onClick={() => navigate('/')}>
            Cancelar
          </Button>
        </Group>

        {error && (
          <Notification color="red" onClose={() => setError(null)}>
            {error}
          </Notification>
        )}

        {success && (
          <Notification color="green">
            ¡Artículo creado exitosamente!
          </Notification>
        )}

        <Grid>
          {/* Formulario */}
          <Grid.Col span={8}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'basic')}>
                <Tabs.List>
                  <Tabs.Tab value="basic">Datos Básicos</Tabs.Tab>
                  <Tabs.Tab value="technical">Técnico</Tabs.Tab>
                  <Tabs.Tab value="variables" disabled={!showAdvancedFields}>
                    Variables {!showAdvancedFields && '🔒'}
                  </Tabs.Tab>
                  <Tabs.Tab value="protocols" disabled={!showAdvancedFields}>
                    Protocolos {!showAdvancedFields && '🔒'}
                  </Tabs.Tab>
                  <Tabs.Tab value="io" disabled={!showAdvancedFields}>
                    I/O {!showAdvancedFields && '🔒'}
                  </Tabs.Tab>
                  <Tabs.Tab value="modbus" disabled={!showAdvancedFields}>
                    Modbus {!showAdvancedFields && '🔒'}
                  </Tabs.Tab>
                  <Tabs.Tab value="sdi12" disabled={!showAdvancedFields}>
                    SDI-12 {!showAdvancedFields && '🔒'}
                  </Tabs.Tab>
                  <Tabs.Tab value="nmea" disabled={!showAdvancedFields}>
                    NMEA {!showAdvancedFields && '🔒'}
                  </Tabs.Tab>
                  <Tabs.Tab value="files">Archivos</Tabs.Tab>
                  <Tabs.Tab value="other">Otros</Tabs.Tab>
                </Tabs.List>

                {/* TAB: Datos Básicos */}
                <Tabs.Panel value="basic" pt="md">
                  <Stack gap="md">
                    <Paper p="md" withBorder>
                      <Title order={5} mb="md">Información SAP</Title>
                      <Grid>
                        <Grid.Col span={12}>
                          <TextInput
                            label="SAP ItemCode"
                            placeholder="A1000123"
                            description="Código del artículo en SAP (opcional)"
                            {...form.getInputProps('sap_itemcode')}
                          />
                        </Grid.Col>
                        <Grid.Col span={12}>
                          <TextInput
                            label="Descripción SAP"
                            placeholder="Descripción completa del artículo"
                            required
                            {...form.getInputProps('sap_description')}
                          />
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <Select
                            label="Tipo de Artículo"
                            placeholder="Selecciona un tipo"
                            data={articleTypes.map(t => ({ value: t.value, label: t.label }))}
                            required
                            searchable
                            {...form.getInputProps('article_type')}
                          />
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <TextInput
                            label="Categoría"
                            placeholder="Sub-clasificación específica"
                            {...form.getInputProps('category')}
                          />
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <TextInput
                            label="Familia"
                            placeholder="Familia del artículo"
                            {...form.getInputProps('family')}
                          />
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <TextInput
                            label="Subfamilia"
                            placeholder="Subfamilia del artículo"
                            {...form.getInputProps('subfamily')}
                          />
                        </Grid.Col>
                      </Grid>
                    </Paper>

                    <Paper p="md" withBorder>
                      <Title order={5} mb="md">Fabricante y Modelo</Title>
                      <Grid>
                        <Grid.Col span={6}>
                          <Select
                            label="Fabricante"
                            placeholder="Selecciona un fabricante"
                            data={manufacturers.map(m => ({ 
                              value: m.manufacturer_id.toString(), 
                              label: m.name 
                            }))}
                            searchable
                            clearable
                            {...form.getInputProps('manufacturer_id')}
                          />
                        </Grid.Col>
                        <Grid.Col span={3}>
                          <TextInput
                            label="Modelo"
                            placeholder="Modelo"
                            {...form.getInputProps('model')}
                          />
                        </Grid.Col>
                        <Grid.Col span={3}>
                          <TextInput
                            label="Variante"
                            placeholder="Variante"
                            {...form.getInputProps('variant')}
                          />
                        </Grid.Col>
                      </Grid>
                    </Paper>
                  </Stack>
                </Tabs.Panel>

                {/* TAB: Técnico */}
                <Tabs.Panel value="technical" pt="md">
                  <Stack gap="md">
                    <Paper p="md" withBorder>
                      <Title order={5} mb="md">Especificaciones Eléctricas</Title>
                      <Grid>
                        <Grid.Col span={3}>
                          <NumberInput
                            label="Alimentación Mín (V)"
                            placeholder="10"
                            {...form.getInputProps('power_supply_min_v')}
                          />
                        </Grid.Col>
                        <Grid.Col span={3}>
                          <NumberInput
                            label="Alimentación Máx (V)"
                            placeholder="30"
                            {...form.getInputProps('power_supply_max_v')}
                          />
                        </Grid.Col>
                        <Grid.Col span={3}>
                          <NumberInput
                            label="Potencia (W)"
                            placeholder="1.5"
                            {...form.getInputProps('power_consumption_typ_w')}
                          />
                        </Grid.Col>
                        <Grid.Col span={3}>
                          <NumberInput
                            label="Corriente Máx (A)"
                            placeholder="5"
                            {...form.getInputProps('current_max_a')}
                          />
                        </Grid.Col>
                        <Grid.Col span={3}>
                          <NumberInput
                            label="Voltaje Nominal (V)"
                            placeholder="24"
                            {...form.getInputProps('voltage_rating_v')}
                          />
                        </Grid.Col>
                      </Grid>
                    </Paper>

                    <Paper p="md" withBorder>
                      <Title order={5} mb="md">Características Físicas</Title>
                      <Grid>
                        <Grid.Col span={4}>
                          <TextInput
                            label="IP Rating"
                            placeholder="IP65"
                            {...form.getInputProps('ip_rating')}
                          />
                        </Grid.Col>
                        <Grid.Col span={4}>
                          <TextInput
                            label="Dimensiones (mm)"
                            placeholder="100 x 50 x 30"
                            {...form.getInputProps('dimensions_mm')}
                          />
                        </Grid.Col>
                        <Grid.Col span={4}>
                          <NumberInput
                            label="Peso (g)"
                            placeholder="500"
                            {...form.getInputProps('weight_g')}
                          />
                        </Grid.Col>
                        <Grid.Col span={3}>
                          <NumberInput
                            label="Longitud (m)"
                            placeholder="100"
                            {...form.getInputProps('length_m')}
                          />
                        </Grid.Col>
                        <Grid.Col span={3}>
                          <NumberInput
                            label="Diámetro (mm)"
                            placeholder="7.5"
                            {...form.getInputProps('diameter_mm')}
                          />
                        </Grid.Col>
                        <Grid.Col span={3}>
                          <TextInput
                            label="Material"
                            placeholder="Cobre + PVC"
                            {...form.getInputProps('material')}
                          />
                        </Grid.Col>
                        <Grid.Col span={3}>
                          <TextInput
                            label="Color"
                            placeholder="Negro"
                            {...form.getInputProps('color')}
                          />
                        </Grid.Col>
                      </Grid>
                    </Paper>

                    <Paper p="md" withBorder>
                      <Title order={5} mb="md">Condiciones Ambientales</Title>
                      <Grid>
                        <Grid.Col span={3}>
                          <NumberInput
                            label="Temp. Op. Mín (°C)"
                            placeholder="-20"
                            {...form.getInputProps('oper_temp_min_c')}
                          />
                        </Grid.Col>
                        <Grid.Col span={3}>
                          <NumberInput
                            label="Temp. Op. Máx (°C)"
                            placeholder="70"
                            {...form.getInputProps('oper_temp_max_c')}
                          />
                        </Grid.Col>
                        <Grid.Col span={3}>
                          <NumberInput
                            label="Temp. Almac. Mín (°C)"
                            placeholder="-40"
                            {...form.getInputProps('storage_temp_min_c')}
                          />
                        </Grid.Col>
                        <Grid.Col span={3}>
                          <NumberInput
                            label="Temp. Almac. Máx (°C)"
                            placeholder="85"
                            {...form.getInputProps('storage_temp_max_c')}
                          />
                        </Grid.Col>
                        <Grid.Col span={4}>
                          <NumberInput
                            label="Humedad Op. Mín (%)"
                            placeholder="0"
                            {...form.getInputProps('oper_humidity_min_pct')}
                          />
                        </Grid.Col>
                        <Grid.Col span={4}>
                          <NumberInput
                            label="Humedad Op. Máx (%)"
                            placeholder="95"
                            {...form.getInputProps('oper_humidity_max_pct')}
                          />
                        </Grid.Col>
                        <Grid.Col span={4}>
                          <NumberInput
                            label="Altitud Máx (m)"
                            placeholder="3000"
                            {...form.getInputProps('altitude_max_m')}
                          />
                        </Grid.Col>
                      </Grid>
                    </Paper>

                    <Paper p="md" withBorder>
                      <Title order={5} mb="md">Certificaciones y Normativas</Title>
                      <Grid>
                        <Grid.Col span={6}>
                          <TextInput
                            label="EMC Compliance"
                            placeholder="CE, FCC"
                            {...form.getInputProps('emc_compliance')}
                          />
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <TextInput
                            label="Certificaciones"
                            placeholder="CE, UL, RoHS, ATEX"
                            {...form.getInputProps('certifications')}
                          />
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <NumberInput
                            label="Año Primera Versión"
                            placeholder="2020"
                            {...form.getInputProps('first_release_year')}
                          />
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <NumberInput
                            label="Año Última Revisión"
                            placeholder="2024"
                            {...form.getInputProps('last_revision_year')}
                          />
                        </Grid.Col>
                      </Grid>
                    </Paper>
                  </Stack>
                </Tabs.Panel>

                {/* TAB: Variables */}
                <Tabs.Panel value="variables" pt="md">
                  {!showAdvancedFields ? (
                    <Paper p="xl" withBorder>
                      <Stack align="center" gap="md">
                        <Text size="xl">🔒</Text>
                        <Text size="lg" fw={500}>Variables no disponibles</Text>
                        <Text c="dimmed" ta="center">
                          Esta sección solo está disponible para artículos de tipo:<br/>
                          <strong>INSTRUMENTO, SENSOR, DATALOGGER, ACTUADOR, MÓDULO I/O, GATEWAY</strong>
                        </Text>
                        <Text c="dimmed" ta="center" size="sm">
                          Por favor, selecciona el tipo de artículo en la pestaña "Datos Básicos"
                        </Text>
                      </Stack>
                    </Paper>
                  ) : (
                    <Paper p="md" withBorder>
                      <Group justify="space-between" mb="md">
                        <Title order={5}>Variables Medidas</Title>
                        <Button onClick={addVariable} leftSection={<IconPlus size={16} />}>
                          Agregar Variable
                        </Button>
                      </Group>
                      
                      {articleVariables.length === 0 ? (
                        <Text c="dimmed" ta="center" py="xl">
                          No hay variables agregadas
                        </Text>
                      ) : (
                        <Table>
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>Variable</Table.Th>
                              <Table.Th>Rango Mín</Table.Th>
                              <Table.Th>Rango Máx</Table.Th>
                              <Table.Th>Unidad</Table.Th>
                              <Table.Th>Precisión</Table.Th>
                              <Table.Th></Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {articleVariables.map((v, i) => (
                              <Table.Tr key={i}>
                                <Table.Td>
                                  <Select
                                    data={variables.map(variable => ({ 
                                      value: variable.variable_id.toString(), 
                                      label: variable.name 
                                    }))}
                                    value={v.variable_id?.toString()}
                                    onChange={(val) => updateItem(articleVariables, setArticleVariables, i, 'variable_id', parseInt(val || '0'))}
                                    searchable
                                  />
                                </Table.Td>
                                <Table.Td>
                                  <NumberInput
                                    value={v.range_min}
                                    onChange={(val) => updateItem(articleVariables, setArticleVariables, i, 'range_min', val)}
                                  />
                                </Table.Td>
                                <Table.Td>
                                  <NumberInput
                                    value={v.range_max}
                                    onChange={(val) => updateItem(articleVariables, setArticleVariables, i, 'range_max', val)}
                                  />
                                </Table.Td>
                                <Table.Td>
                                  <TextInput
                                    value={v.unit}
                                    onChange={(e) => updateItem(articleVariables, setArticleVariables, i, 'unit', e.target.value)}
                                  />
                                </Table.Td>
                                <Table.Td>
                                  <NumberInput
                                    value={v.accuracy_abs}
                                    onChange={(val) => updateItem(articleVariables, setArticleVariables, i, 'accuracy_abs', val)}
                                  />
                                </Table.Td>
                                <Table.Td>
                                  <ActionIcon 
                                    color="red" 
                                    onClick={() => removeItem(articleVariables, setArticleVariables, i)}
                                  >
                                    <IconTrash size={16} />
                                  </ActionIcon>
                                </Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      )}
                    </Paper>
                  )}
                </Tabs.Panel>

                {/* TAB: Protocolos */}
                <Tabs.Panel value="protocols" pt="md">
                  {!showAdvancedFields ? (
                    <Paper p="xl" withBorder>
                      <Stack align="center" gap="md">
                        <Text size="xl">🔒</Text>
                        <Text size="lg" fw={500}>Protocolos no disponibles</Text>
                        <Text c="dimmed" ta="center">
                          Esta sección solo está disponible para artículos con protocolos de comunicación
                        </Text>
                      </Stack>
                    </Paper>
                  ) : (
                    <Paper p="md" withBorder>
                      <Group justify="space-between" mb="md">
                        <Title order={5}>Protocolos de Comunicación</Title>
                        <Button onClick={addProtocol} leftSection={<IconPlus size={16} />}>
                          Agregar Protocolo
                        </Button>
                      </Group>
                      
                      {articleProtocols.length === 0 ? (
                        <Text c="dimmed" ta="center" py="xl">
                          No hay protocolos agregados
                        </Text>
                      ) : (
                        <Stack gap="md">
                          {articleProtocols.map((p, i) => (
                            <Paper key={i} p="sm" withBorder>
                              <Grid>
                                <Grid.Col span={11}>
                                  <Grid>
                                    <Grid.Col span={4}>
                                      <Select
                                        label="Tipo"
                                        data={[
                                          'ModbusRTU', 'ModbusTCP', 'SDI12', 'NMEA0183',
                                          'CANopen', 'Profinet', 'EthernetIP', 'RS232', 'RS485', 'Other'
                                        ]}
                                        value={p.type}
                                        onChange={(val) => updateItem(articleProtocols, setArticleProtocols, i, 'type', val)}
                                      />
                                    </Grid.Col>
                                    <Grid.Col span={4}>
                                      <TextInput
                                        label="Capa Física"
                                        value={p.physical_layer}
                                        onChange={(e) => updateItem(articleProtocols, setArticleProtocols, i, 'physical_layer', e.target.value)}
                                      />
                                    </Grid.Col>
                                    <Grid.Col span={4}>
                                      <TextInput
                                        label="Puerto"
                                        value={p.port_label}
                                        onChange={(e) => updateItem(articleProtocols, setArticleProtocols, i, 'port_label', e.target.value)}
                                      />
                                    </Grid.Col>
                                    <Grid.Col span={3}>
                                      <NumberInput
                                        label="Baudrate"
                                        value={p.baudrate}
                                        onChange={(val) => updateItem(articleProtocols, setArticleProtocols, i, 'baudrate', val)}
                                      />
                                    </Grid.Col>
                                    <Grid.Col span={3}>
                                      <NumberInput
                                        label="Data Bits"
                                        value={p.databits}
                                        onChange={(val) => updateItem(articleProtocols, setArticleProtocols, i, 'databits', val)}
                                      />
                                    </Grid.Col>
                                    <Grid.Col span={3}>
                                      <Select
                                        label="Paridad"
                                        data={['N', 'E', 'O']}
                                        value={p.parity}
                                        onChange={(val) => updateItem(articleProtocols, setArticleProtocols, i, 'parity', val)}
                                      />
                                    </Grid.Col>
                                    <Grid.Col span={3}>
                                      <NumberInput
                                        label="Stop Bits"
                                        value={p.stopbits}
                                        onChange={(val) => updateItem(articleProtocols, setArticleProtocols, i, 'stopbits', val)}
                                      />
                                    </Grid.Col>
                                  </Grid>
                                </Grid.Col>
                                <Grid.Col span={1}>
                                  <ActionIcon 
                                    color="red" 
                                    onClick={() => removeItem(articleProtocols, setArticleProtocols, i)}
                                    mt="xl"
                                  >
                                    <IconTrash size={16} />
                                  </ActionIcon>
                                </Grid.Col>
                              </Grid>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </Paper>
                  )}
                </Tabs.Panel>

                {/* TAB: I/O */}
                <Tabs.Panel value="io" pt="md">
                  {!showAdvancedFields ? (
                    <Paper p="xl" withBorder>
                      <Stack align="center" gap="md">
                        <Text size="xl">🔒</Text>
                        <Text size="lg" fw={500}>I/O no disponible</Text>
                        <Text c="dimmed" ta="center">
                          Esta sección solo está disponible para artículos con entradas/salidas
                        </Text>
                      </Stack>
                    </Paper>
                  ) : (
                    <Stack gap="md">
                      {/* Analog Outputs */}
                      <Paper p="md" withBorder>
                        <Group justify="space-between" mb="md">
                          <Title order={5}>Salidas Analógicas</Title>
                          <Button onClick={addAnalogOutput} leftSection={<IconPlus size={16} />} size="xs">
                            Agregar
                          </Button>
                        </Group>
                        {analogOutputs.map((ao, i) => (
                          <Grid key={i} mb="sm">
                            <Grid.Col span={3}>
                              <Select
                                label="Tipo"
                                data={['Current_4_20mA', 'Voltage_0_10V', 'Pulse', 'Relay', 'TTL', 'Other']}
                                value={ao.type}
                                onChange={(val) => updateItem(analogOutputs, setAnalogOutputs, i, 'type', val)}
                              />
                            </Grid.Col>
                            <Grid.Col span={2}>
                              <NumberInput
                                label="Canales"
                                value={ao.num_channels}
                                onChange={(val) => updateItem(analogOutputs, setAnalogOutputs, i, 'num_channels', val)}
                              />
                            </Grid.Col>
                            <Grid.Col span={2}>
                              <TextInput
                                label="Unidad"
                                value={ao.unit}
                                onChange={(e) => updateItem(analogOutputs, setAnalogOutputs, i, 'unit', e.target.value)}
                              />
                            </Grid.Col>
                            <Grid.Col span={4}>
                              <TextInput
                                label="Notas"
                                value={ao.notes}
                                onChange={(e) => updateItem(analogOutputs, setAnalogOutputs, i, 'notes', e.target.value)}
                              />
                            </Grid.Col>
                            <Grid.Col span={1}>
                              <ActionIcon 
                                color="red" 
                                onClick={() => removeItem(analogOutputs, setAnalogOutputs, i)}
                                mt="xl"
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Grid.Col>
                          </Grid>
                        ))}
                      </Paper>

                      {/* Digital I/O */}
                      <Paper p="md" withBorder>
                        <Group justify="space-between" mb="md">
                          <Title order={5}>I/O Digital</Title>
                          <Button onClick={addDigitalIO} leftSection={<IconPlus size={16} />} size="xs">
                            Agregar
                          </Button>
                        </Group>
                        {digitalIO.map((dio, i) => (
                          <Grid key={i} mb="sm">
                            <Grid.Col span={3}>
                              <Select
                                label="Dirección"
                                data={['input', 'output']}
                                value={dio.direction}
                                onChange={(val) => updateItem(digitalIO, setDigitalIO, i, 'direction', val)}
                              />
                            </Grid.Col>
                            <Grid.Col span={3}>
                              <Select
                                label="Tipo de Señal"
                                data={['Current_4_20mA', 'Voltage_0_10V', 'Pulse', 'Relay', 'TTL', 'Other']}
                                value={dio.signal_type}
                                onChange={(val) => updateItem(digitalIO, setDigitalIO, i, 'signal_type', val)}
                              />
                            </Grid.Col>
                            <Grid.Col span={2}>
                              <TextInput
                                label="Nivel Voltaje"
                                value={dio.voltage_level}
                                onChange={(e) => updateItem(digitalIO, setDigitalIO, i, 'voltage_level', e.target.value)}
                              />
                            </Grid.Col>
                            <Grid.Col span={3}>
                              <TextInput
                                label="Notas"
                                value={dio.notes}
                                onChange={(e) => updateItem(digitalIO, setDigitalIO, i, 'notes', e.target.value)}
                              />
                            </Grid.Col>
                            <Grid.Col span={1}>
                              <ActionIcon 
                                color="red" 
                                onClick={() => removeItem(digitalIO, setDigitalIO, i)}
                                mt="xl"
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Grid.Col>
                          </Grid>
                        ))}
                      </Paper>
                    </Stack>
                  )}
                </Tabs.Panel>

                {/* TAB: Modbus */}
                <Tabs.Panel value="modbus" pt="md">
                  {!showAdvancedFields ? (
                    <Paper p="xl" withBorder>
                      <Stack align="center" gap="md">
                        <Text size="xl">🔒</Text>
                        <Text size="lg" fw={500}>Modbus no disponible</Text>
                        <Text c="dimmed" ta="center">
                          Esta sección solo está disponible para artículos con protocolo Modbus
                        </Text>
                      </Stack>
                    </Paper>
                  ) : (
                    <Paper p="md" withBorder>
                      <Group justify="space-between" mb="md">
                        <Title order={5}>Registros Modbus</Title>
                        <Button onClick={addModbusRegister} leftSection={<IconPlus size={16} />}>
                          Agregar Registro
                        </Button>
                      </Group>
                      {modbusRegisters.length === 0 ? (
                        <Text c="dimmed" ta="center" py="xl">
                          No hay registros Modbus agregados
                        </Text>
                      ) : (
                        <Stack gap="sm">
                          {modbusRegisters.map((reg, i) => (
                            <Paper key={i} p="sm" withBorder>
                              <Grid>
                                <Grid.Col span={11}>
                                  <Grid>
                                    <Grid.Col span={2}>
                                      <NumberInput
                                        label="FC"
                                        value={reg.function_code}
                                        onChange={(val) => updateItem(modbusRegisters, setModbusRegisters, i, 'function_code', val)}
                                      />
                                    </Grid.Col>
                                    <Grid.Col span={2}>
                                      <NumberInput
                                        label="Dirección"
                                        value={reg.address}
                                        onChange={(val) => updateItem(modbusRegisters, setModbusRegisters, i, 'address', val)}
                                      />
                                    </Grid.Col>
                                    <Grid.Col span={4}>
                                      <TextInput
                                        label="Nombre"
                                        value={reg.name}
                                        onChange={(e) => updateItem(modbusRegisters, setModbusRegisters, i, 'name', e.target.value)}
                                      />
                                    </Grid.Col>
                                    <Grid.Col span={2}>
                                      <Select
                                        label="Tipo Dato"
                                        data={['INT16', 'UINT16', 'INT32', 'UINT32', 'FLOAT32']}
                                        value={reg.datatype}
                                        onChange={(val) => updateItem(modbusRegisters, setModbusRegisters, i, 'datatype', val)}
                                      />
                                    </Grid.Col>
                                    <Grid.Col span={2}>
                                      <Select
                                        label="R/W"
                                        data={['R', 'W', 'RW']}
                                        value={reg.rw}
                                        onChange={(val) => updateItem(modbusRegisters, setModbusRegisters, i, 'rw', val)}
                                      />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                      <TextInput
                                        label="Descripción"
                                        value={reg.description}
                                        onChange={(e) => updateItem(modbusRegisters, setModbusRegisters, i, 'description', e.target.value)}
                                      />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                      <TextInput
                                        label="Unidad"
                                        value={reg.unit}
                                        onChange={(e) => updateItem(modbusRegisters, setModbusRegisters, i, 'unit', e.target.value)}
                                      />
                                    </Grid.Col>
                                  </Grid>
                                </Grid.Col>
                                <Grid.Col span={1}>
                                  <ActionIcon 
                                    color="red" 
                                    onClick={() => removeItem(modbusRegisters, setModbusRegisters, i)}
                                    mt="xl"
                                  >
                                    <IconTrash size={16} />
                                  </ActionIcon>
                                </Grid.Col>
                              </Grid>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </Paper>
                  )}
                </Tabs.Panel>

                {/* TAB: SDI-12 */}
                <Tabs.Panel value="sdi12" pt="md">
                  {!showAdvancedFields ? (
                    <Paper p="xl" withBorder>
                      <Stack align="center" gap="md">
                        <Text size="xl">🔒</Text>
                        <Text size="lg" fw={500}>SDI-12 no disponible</Text>
                        <Text c="dimmed" ta="center">
                          Esta sección solo está disponible para artículos con protocolo SDI-12
                        </Text>
                      </Stack>
                    </Paper>
                  ) : (
                    <Paper p="md" withBorder>
                      <Group justify="space-between" mb="md">
                        <Title order={5}>Comandos SDI-12</Title>
                        <Button onClick={addSDI12Command} leftSection={<IconPlus size={16} />}>
                          Agregar Comando
                        </Button>
                      </Group>
                      {sdi12Commands.length === 0 ? (
                        <Text c="dimmed" ta="center" py="xl">
                          No hay comandos SDI-12 agregados
                        </Text>
                      ) : (
                        <Stack gap="sm">
                          {sdi12Commands.map((cmd, i) => (
                            <Paper key={i} p="sm" withBorder>
                              <Grid>
                                <Grid.Col span={11}>
                                  <Grid>
                                    <Grid.Col span={4}>
                                      <TextInput
                                        label="Comando"
                                        placeholder="aM!"
                                        value={cmd.command}
                                        onChange={(e) => updateItem(sdi12Commands, setSdi12Commands, i, 'command', e.target.value)}
                                      />
                                    </Grid.Col>
                                    <Grid.Col span={8}>
                                      <TextInput
                                        label="Descripción"
                                        value={cmd.description}
                                        onChange={(e) => updateItem(sdi12Commands, setSdi12Commands, i, 'description', e.target.value)}
                                      />
                                    </Grid.Col>
                                    <Grid.Col span={12}>
                                      <TextInput
                                        label="Formato de Respuesta"
                                        placeholder="a+value1+value2+value3"
                                        value={cmd.response_format}
                                        onChange={(e) => updateItem(sdi12Commands, setSdi12Commands, i, 'response_format', e.target.value)}
                                      />
                                    </Grid.Col>
                                  </Grid>
                                </Grid.Col>
                                <Grid.Col span={1}>
                                  <ActionIcon 
                                    color="red" 
                                    onClick={() => removeItem(sdi12Commands, setSdi12Commands, i)}
                                    mt="xl"
                                  >
                                    <IconTrash size={16} />
                                  </ActionIcon>
                                </Grid.Col>
                              </Grid>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </Paper>
                  )}
                </Tabs.Panel>

                {/* TAB: NMEA */}
                <Tabs.Panel value="nmea" pt="md">
                  {!showAdvancedFields ? (
                    <Paper p="xl" withBorder>
                      <Stack align="center" gap="md">
                        <Text size="xl">🔒</Text>
                        <Text size="lg" fw={500}>NMEA no disponible</Text>
                        <Text c="dimmed" ta="center">
                          Esta sección solo está disponible para artículos con protocolo NMEA 0183
                        </Text>
                      </Stack>
                    </Paper>
                  ) : (
                    <Paper p="md" withBorder>
                      <Group justify="space-between" mb="md">
                        <Title order={5}>Sentencias NMEA 0183</Title>
                        <Button onClick={addNMEASentence} leftSection={<IconPlus size={16} />}>
                          Agregar Sentencia
                        </Button>
                      </Group>
                      {nmeaSentences.length === 0 ? (
                        <Text c="dimmed" ta="center" py="xl">
                          No hay sentencias NMEA agregadas
                        </Text>
                      ) : (
                        <Stack gap="sm">
                          {nmeaSentences.map((nmea, i) => (
                            <Paper key={i} p="sm" withBorder>
                              <Grid>
                                <Grid.Col span={11}>
                                  <Grid>
                                    <Grid.Col span={4}>
                                      <TextInput
                                        label="Sentencia"
                                        placeholder="$GPGGA"
                                        value={nmea.sentence}
                                        onChange={(e) => updateItem(nmeaSentences, setNmeaSentences, i, 'sentence', e.target.value)}
                                      />
                                    </Grid.Col>
                                    <Grid.Col span={8}>
                                      <TextInput
                                        label="Descripción"
                                        value={nmea.description}
                                        onChange={(e) => updateItem(nmeaSentences, setNmeaSentences, i, 'description', e.target.value)}
                                      />
                                    </Grid.Col>
                                    <Grid.Col span={12}>
                                      <TextInput
                                        label="Campos"
                                        placeholder="time,lat,lon,quality,sats,hdop,alt"
                                        value={nmea.fields}
                                        onChange={(e) => updateItem(nmeaSentences, setNmeaSentences, i, 'fields', e.target.value)}
                                      />
                                    </Grid.Col>
                                  </Grid>
                                </Grid.Col>
                                <Grid.Col span={1}>
                                  <ActionIcon 
                                    color="red" 
                                    onClick={() => removeItem(nmeaSentences, setNmeaSentences, i)}
                                    mt="xl"
                                  >
                                    <IconTrash size={16} />
                                  </ActionIcon>
                                </Grid.Col>
                              </Grid>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </Paper>
                  )}
                </Tabs.Panel>

                {/* TAB: Archivos */}
                <Tabs.Panel value="files" pt="md">
                  <Stack gap="md">
                    {/* Documentos */}
                    <Paper p="md" withBorder>
                      <Group justify="space-between" mb="md">
                        <Title order={5}>Documentos</Title>
                        <Button onClick={addDocument} leftSection={<IconPlus size={16} />} size="xs">
                          Agregar Documento
                        </Button>
                      </Group>
                      {documents.length === 0 ? (
                        <Text c="dimmed" ta="center" py="xl">
                          No hay documentos agregados
                        </Text>
                      ) : (
                        <Stack gap="sm">
                          {documents.map((doc, i) => (
                            <Paper key={i} p="sm" withBorder>
                              <Grid>
                                <Grid.Col span={11}>
                                  <Grid>
                                    <Grid.Col span={3}>
                                      <Select
                                        label="Tipo"
                                        data={['datasheet', 'manual', 'certificate', 'drawing', 'other']}
                                        value={doc.type}
                                        onChange={(val) => updateItem(documents, setDocuments, i, 'type', val)}
                                      />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                      <TextInput
                                        label="Título"
                                        value={doc.title}
                                        onChange={(e) => updateItem(documents, setDocuments, i, 'title', e.target.value)}
                                      />
                                    </Grid.Col>
                                    <Grid.Col span={3}>
                                      <TextInput
                                        label="Idioma"
                                        placeholder="ES"
                                        value={doc.language}
                                        onChange={(e) => updateItem(documents, setDocuments, i, 'language', e.target.value)}
                                      />
                                    </Grid.Col>
                                    <Grid.Col span={12}>
                                      <TextInput
                                        label="URL / Ruta"
                                        placeholder="https://... o /uploads/..."
                                        value={doc.url_or_path}
                                        onChange={(e) => updateItem(documents, setDocuments, i, 'url_or_path', e.target.value)}
                                      />
                                    </Grid.Col>
                                  </Grid>
                                </Grid.Col>
                                <Grid.Col span={1}>
                                  <ActionIcon 
                                    color="red" 
                                    onClick={() => removeItem(documents, setDocuments, i)}
                                    mt="xl"
                                  >
                                    <IconTrash size={16} />
                                  </ActionIcon>
                                </Grid.Col>
                              </Grid>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </Paper>

                    {/* Imágenes */}
                    <Paper p="md" withBorder>
                      <Group justify="space-between" mb="md">
                        <Title order={5}>Imágenes</Title>
                        <Button onClick={addImage} leftSection={<IconPlus size={16} />} size="xs">
                          Agregar Imagen
                        </Button>
                      </Group>
                      {images.length === 0 ? (
                        <Text c="dimmed" ta="center" py="xl">
                          No hay imágenes agregadas
                        </Text>
                      ) : (
                        <Stack gap="sm">
                          {images.map((img, i) => (
                            <Paper key={i} p="sm" withBorder>
                              <Grid>
                                <Grid.Col span={11}>
                                  <Grid>
                                    <Grid.Col span={4}>
                                      <TextInput
                                        label="Descripción"
                                        value={img.caption}
                                        onChange={(e) => updateItem(images, setImages, i, 'caption', e.target.value)}
                                      />
                                    </Grid.Col>
                                    <Grid.Col span={8}>
                                      <TextInput
                                        label="URL / Ruta"
                                        placeholder="https://... o /uploads/..."
                                        value={img.url_or_path}
                                        onChange={(e) => updateItem(images, setImages, i, 'url_or_path', e.target.value)}
                                      />
                                    </Grid.Col>
                                  </Grid>
                                </Grid.Col>
                                <Grid.Col span={1}>
                                  <ActionIcon 
                                    color="red" 
                                    onClick={() => removeItem(images, setImages, i)}
                                    mt="xl"
                                  >
                                    <IconTrash size={16} />
                                  </ActionIcon>
                                </Grid.Col>
                              </Grid>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </Paper>
                  </Stack>
                </Tabs.Panel>

                {/* TAB: Otros */}
                <Tabs.Panel value="other" pt="md">
                  <Stack gap="md">
                    {/* Tags */}
                    <Paper p="md" withBorder>
                      <Title order={5} mb="md">Tags</Title>
                      <Group mb="md">
                        <TextInput
                          placeholder="Agregar tag"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                          style={{ flex: 1 }}
                        />
                        <Button onClick={addTag}>Agregar</Button>
                      </Group>
                      <Group gap="xs">
                        {tags.map((tag, i) => (
                          <Group key={i} gap={5}>
                            <Text size="sm">{tag}</Text>
                            <ActionIcon size="xs" color="red" onClick={() => setTags(tags.filter((_, idx) => idx !== i))}>
                              <IconTrash size={12} />
                            </ActionIcon>
                          </Group>
                        ))}
                      </Group>
                    </Paper>

                    {/* Notas */}
                    <Paper p="md" withBorder>
                      <Title order={5} mb="md">Notas y Estado</Title>
                      <Stack gap="md">
                        <Textarea
                          label="Notas Internas"
                          placeholder="Notas adicionales sobre el artículo"
                          rows={4}
                          {...form.getInputProps('internal_notes')}
                        />
                        <Switch
                          label="Artículo Activo"
                          {...form.getInputProps('active', { type: 'checkbox' })}
                        />
                      </Stack>
                    </Paper>
                  </Stack>
                </Tabs.Panel>
              </Tabs>

              {/* Botones de acción */}
              <Group justify="flex-end" mt="lg">
                <Button variant="subtle" onClick={() => navigate('/')}>
                  Cancelar
                </Button>
                <Button type="submit" loading={loading}>
                  Crear Artículo
                </Button>
              </Group>
            </form>
          </Grid.Col>

          {/* Preview JSON */}
          <Grid.Col span={4}>
            <Paper p="md" withBorder style={{ position: 'sticky', top: 20 }}>
              <Title order={5} mb="md">Vista Previa JSON</Title>
              <div style={{ maxHeight: '80vh', overflow: 'auto', backgroundColor: '#272822', padding: '10px', borderRadius: '4px' }}>
                <JsonView 
                  data={getPreviewObject()} 
                  shouldExpandNode={allExpanded}
                  style={defaultStyles}
                />
              </div>
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}

export default ArticleNew;
