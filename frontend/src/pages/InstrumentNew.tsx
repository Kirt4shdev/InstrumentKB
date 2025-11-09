import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Paper,
  Stack,
  Group,
  Button,
  TextInput,
  NumberInput,
  Select,
  Textarea,
  Grid,
  Tabs,
  ActionIcon,
  Table,
  FileInput,
  Badge,
  Divider,
  Modal,
  Checkbox
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconPlus, IconTrash, IconUpload } from '@tabler/icons-react';
import { getManufacturers, getVariables, getArticles, createInstrument, createArticle, createManufacturer, createVariable } from '../api';
import type { Manufacturer, Variable, Article, Instrument } from '../types';
import { JsonView, allExpanded, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

export default function InstrumentNew() {
  const navigate = useNavigate();
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [articleModalOpened, setArticleModalOpened] = useState(false);
  const [newArticle, setNewArticle] = useState({
    article_id: '',
    sap_itemcode: '',
    sap_description: '',
    family: '',
    subfamily: '',
    internal_notes: '',
    active: true
  });

  const form = useForm({
    initialValues: {
      article_id: '',
      manufacturer_id: '',
      model: '',
      variant: '',
      category: '',
      power_supply_min_v: undefined,
      power_supply_max_v: undefined,
      power_consumption_typ_w: undefined,
      ip_rating: '',
      dimensions_mm: '',
      weight_g: undefined,
      oper_temp_min_c: undefined,
      oper_temp_max_c: undefined,
      storage_temp_min_c: undefined,
      storage_temp_max_c: undefined,
      oper_humidity_min_pct: undefined,
      oper_humidity_max_pct: undefined,
      altitude_max_m: undefined,
      emc_compliance: '',
      first_release_year: undefined,
      last_revision_year: undefined,
      
      // Variables
      variables: [] as any[],
      
      // Protocols
      protocols: [] as any[],
      
      // Analog Outputs
      analog_outputs: [] as any[],
      
      // Digital I/O
      digital_io: [] as any[],
      
      // Modbus Registers
      modbus_registers: [] as any[],
      
      // Tags
      tags: [] as string[],
      
      // Documents & Images (managed separately with upload)
      documents: [] as any[],
      images: [] as any[]
    }
  });

  useEffect(() => {
    loadArticles();
    loadManufacturers();
    loadVariables();
  }, []);

  const loadArticles = async () => {
    try {
      const response = await getArticles({ active: true });
      setArticles(response.data);
    } catch (error) {
      console.error('Error loading articles:', error);
    }
  };

  const loadManufacturers = async () => {
    try {
      const response = await getManufacturers();
      setManufacturers(response.data);
    } catch (error) {
      console.error('Error loading manufacturers:', error);
    }
  };

  const loadVariables = async () => {
    try {
      const response = await getVariables();
      setVariables(response.data);
    } catch (error) {
      console.error('Error loading variables:', error);
    }
  };

  const handleCreateArticle = async () => {
    try {
      const response = await createArticle(newArticle);
      notifications.show({
        title: 'Éxito',
        message: 'Artículo SAP creado correctamente',
        color: 'green'
      });
      setArticles([...articles, response.data]);
      form.setFieldValue('article_id', response.data.article_id);
      setArticleModalOpened(false);
      setNewArticle({
        article_id: '',
        sap_itemcode: '',
        sap_description: '',
        family: '',
        subfamily: '',
        internal_notes: '',
        active: true
      });
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Error al crear artículo SAP',
        color: 'red'
      });
    }
  };

  const addVariable = () => {
    form.insertListItem('variables', {
      variable_id: '',
      range_min: undefined,
      range_max: undefined,
      unit: '',
      accuracy_abs: undefined,
      accuracy_rel_pct: undefined,
      resolution: undefined,
      update_rate_hz: undefined,
      notes: ''
    });
  };

  const addProtocol = () => {
    form.insertListItem('protocols', {
      type: '',
      physical_layer: '',
      port_label: '',
      default_address: '',
      baudrate: undefined,
      databits: 8,
      parity: 'N',
      stopbits: 1,
      ip_address: '',
      ip_port: undefined,
      notes: ''
    });
  };

  const addAnalogOutput = () => {
    form.insertListItem('analog_outputs', {
      type: 'Current_4_20mA',
      num_channels: 1,
      range_min: undefined,
      range_max: undefined,
      unit: '',
      load_min_ohm: undefined,
      load_max_ohm: undefined,
      accuracy: '',
      scaling_notes: ''
    });
  };

  const addDigitalIO = () => {
    form.insertListItem('digital_io', {
      direction: 'output',
      signal_type: 'TTL',
      voltage_level: '',
      current_max_ma: undefined,
      frequency_max_hz: undefined,
      notes: ''
    });
  };

  const addModbusRegister = () => {
    form.insertListItem('modbus_registers', {
      function_code: 3,
      address: 0,
      name: '',
      description: '',
      datatype: 'UINT16',
      scale: 1,
      unit: '',
      rw: 'R',
      min: undefined,
      max: undefined,
      default_value: '',
      notes: ''
    });
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      // Preparar datos para enviar
      const instrumentData: any = {
        article_id: values.article_id || null,
        manufacturer_id: parseInt(values.manufacturer_id),
        model: values.model,
        variant: values.variant || null,
        category: values.category || null,
        power_supply_min_v: values.power_supply_min_v || null,
        power_supply_max_v: values.power_supply_max_v || null,
        power_consumption_typ_w: values.power_consumption_typ_w || null,
        ip_rating: values.ip_rating || null,
        dimensions_mm: values.dimensions_mm || null,
        weight_g: values.weight_g || null,
        oper_temp_min_c: values.oper_temp_min_c || null,
        oper_temp_max_c: values.oper_temp_max_c || null,
        storage_temp_min_c: values.storage_temp_min_c || null,
        storage_temp_max_c: values.storage_temp_max_c || null,
        oper_humidity_min_pct: values.oper_humidity_min_pct || null,
        oper_humidity_max_pct: values.oper_humidity_max_pct || null,
        altitude_max_m: values.altitude_max_m || null,
        emc_compliance: values.emc_compliance || null,
        first_release_year: values.first_release_year || null,
        last_revision_year: values.last_revision_year || null
      };

      // Variables
      if (values.variables.length > 0) {
        instrumentData.variables = values.variables
          .filter((v: any) => v.variable_id)
          .map((v: any) => ({
            variable_id: parseInt(v.variable_id),
            range_min: v.range_min || null,
            range_max: v.range_max || null,
            unit: v.unit || null,
            accuracy_abs: v.accuracy_abs || null,
            accuracy_rel_pct: v.accuracy_rel_pct || null,
            resolution: v.resolution || null,
            update_rate_hz: v.update_rate_hz || null,
            notes: v.notes || null
          }));
      }

      // Protocols
      if (values.protocols.length > 0) {
        instrumentData.protocols = values.protocols
          .filter((p: any) => p.type)
          .map((p: any) => ({
            type: p.type,
            physical_layer: p.physical_layer || null,
            port_label: p.port_label || null,
            default_address: p.default_address || null,
            baudrate: p.baudrate || null,
            databits: p.databits || null,
            parity: p.parity || null,
            stopbits: p.stopbits || null,
            ip_address: p.ip_address || null,
            ip_port: p.ip_port || null,
            notes: p.notes || null
          }));
      }

      // Analog Outputs
      if (values.analog_outputs.length > 0) {
        instrumentData.analog_outputs = values.analog_outputs.map((ao: any) => ({
          type: ao.type,
          num_channels: ao.num_channels || null,
          range_min: ao.range_min || null,
          range_max: ao.range_max || null,
          unit: ao.unit || null,
          load_min_ohm: ao.load_min_ohm || null,
          load_max_ohm: ao.load_max_ohm || null,
          accuracy: ao.accuracy || null,
          scaling_notes: ao.scaling_notes || null
        }));
      }

      // Digital I/O
      if (values.digital_io.length > 0) {
        instrumentData.digital_io = values.digital_io.map((dio: any) => ({
          direction: dio.direction,
          signal_type: dio.signal_type,
          voltage_level: dio.voltage_level || null,
          current_max_ma: dio.current_max_ma || null,
          frequency_max_hz: dio.frequency_max_hz || null,
          notes: dio.notes || null
        }));
      }

      // Modbus Registers
      if (values.modbus_registers.length > 0) {
        instrumentData.modbus_registers = values.modbus_registers
          .filter((mr: any) => mr.name && mr.address !== undefined)
          .map((mr: any) => ({
            function_code: mr.function_code,
            address: mr.address,
            name: mr.name,
            description: mr.description || null,
            datatype: mr.datatype || null,
            scale: mr.scale || null,
            unit: mr.unit || null,
            rw: mr.rw,
            min: mr.min || null,
            max: mr.max || null,
            default_value: mr.default_value || null,
            notes: mr.notes || null
          }));
      }

      // Tags
      if (values.tags.length > 0) {
        instrumentData.tags = values.tags;
      }

      const response = await createInstrument(instrumentData);
      
      notifications.show({
        title: 'Éxito',
        message: 'Instrumento creado correctamente',
        color: 'green'
      });

      navigate(`/instrument/${response.data.instrument_id}`);
    } catch (error: any) {
      console.error('Error creating instrument:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Error al crear el instrumento',
        color: 'red'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Generar objeto JSON en tiempo real
  const getPreviewObject = () => {
    const values = form.values;
    const selectedArticle = articles.find(a => a.article_id === values.article_id);
    return {
      article_sap: selectedArticle ? {
        article_id: selectedArticle.article_id,
        sap_itemcode: selectedArticle.sap_itemcode,
        sap_description: selectedArticle.sap_description,
        family: selectedArticle.family,
        subfamily: selectedArticle.subfamily
      } : null,
      manufacturer_id: values.manufacturer_id ? parseInt(values.manufacturer_id) : null,
      model: values.model || '',
      variant: values.variant || null,
      category: values.category || null,
      specifications: {
        power: {
          supply_min_v: values.power_supply_min_v || null,
          supply_max_v: values.power_supply_max_v || null,
          consumption_typ_w: values.power_consumption_typ_w || null
        },
        physical: {
          ip_rating: values.ip_rating || null,
          dimensions_mm: values.dimensions_mm || null,
          weight_g: values.weight_g || null
        },
        environmental: {
          operating_temp: {
            min_c: values.oper_temp_min_c || null,
            max_c: values.oper_temp_max_c || null
          },
          storage_temp: {
            min_c: values.storage_temp_min_c || null,
            max_c: values.storage_temp_max_c || null
          },
          humidity: {
            min_pct: values.oper_humidity_min_pct || null,
            max_pct: values.oper_humidity_max_pct || null
          },
          altitude_max_m: values.altitude_max_m || null
        }
      },
      variables: values.variables.filter(v => v.variable_id),
      protocols: values.protocols.filter(p => p.type),
      analog_outputs: values.analog_outputs,
      digital_io: values.digital_io,
      modbus_registers: values.modbus_registers.filter(mr => mr.name),
      tags: values.tags
    };
  };

  return (
    <Container size="xl">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid>
          <Grid.Col span={{ base: 12, lg: 7 }}>
            <Stack gap="lg">
              <Group justify="space-between">
                <Group>
                  <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate('/')}>
                    Volver
                  </Button>
                  <Title order={2}>Nuevo Instrumento</Title>
                </Group>
                <Button type="submit" loading={submitting}>
                  Guardar Instrumento
                </Button>
              </Group>

              <Tabs defaultValue="basic">
                <Tabs.List>
                  <Tabs.Tab value="basic">Básicos</Tabs.Tab>
                  <Tabs.Tab value="variables">Variables</Tabs.Tab>
                  <Tabs.Tab value="protocols">Protocolos</Tabs.Tab>
                  <Tabs.Tab value="io">I/O</Tabs.Tab>
                  <Tabs.Tab value="modbus">Modbus</Tabs.Tab>
                  <Tabs.Tab value="tags">Tags</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="basic" pt="md">
                  <Paper p="md" withBorder>
                    <Stack gap="md">
                      <Paper p="md" withBorder style={{ backgroundColor: '#f8f9fa' }}>
                        <Title order={5} mb="md">🔗 Artículo SAP (Maestro Corporativo)</Title>
                        <Group align="flex-end">
                          <Select
                            label="Artículo SAP"
                            placeholder="Selecciona un artículo SAP"
                            data={articles.map(a => ({ 
                              value: a.article_id, 
                              label: `${a.article_id} - ${a.sap_description.substring(0, 50)}${a.sap_description.length > 50 ? '...' : ''}` 
                            }))}
                            searchable
                            style={{ flex: 1 }}
                            {...form.getInputProps('article_id')}
                            description="Código maestro interno del artículo en SAP"
                          />
                          <Button 
                            variant="light" 
                            onClick={() => setArticleModalOpened(true)}
                          >
                            + Nuevo Artículo SAP
                          </Button>
                        </Group>
                      </Paper>

                      <Divider label="Especificaciones Técnicas del Instrumento" />

                      <Select
                        label="Fabricante"
                        placeholder="Selecciona un fabricante"
                        data={manufacturers.map(m => ({ value: m.manufacturer_id.toString(), label: m.name }))}
                        searchable
                        required
                        {...form.getInputProps('manufacturer_id')}
                      />

                      <TextInput
                        label="Modelo"
                        placeholder="ej. CTD-10"
                        required
                        {...form.getInputProps('model')}
                      />

                      <TextInput
                        label="Variante"
                        placeholder="ej. v2.1"
                        {...form.getInputProps('variant')}
                      />

                      <TextInput
                        label="Categoría"
                        placeholder="ej. Sensor CTD, Datalogger, Transmisor"
                        {...form.getInputProps('category')}
                      />

                      <Divider label="Especificaciones eléctricas" />

                      <Grid>
                        <Grid.Col span={6}>
                          <NumberInput
                            label="Alimentación mín. (V)"
                            {...form.getInputProps('power_supply_min_v')}
                          />
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <NumberInput
                            label="Alimentación máx. (V)"
                            {...form.getInputProps('power_supply_max_v')}
                          />
                        </Grid.Col>
                      </Grid>

                      <NumberInput
                        label="Consumo típico (W)"
                        {...form.getInputProps('power_consumption_typ_w')}
                      />

                      <Divider label="Especificaciones físicas" />

                      <TextInput
                        label="IP Rating"
                        placeholder="ej. IP68"
                        {...form.getInputProps('ip_rating')}
                      />

                      <TextInput
                        label="Dimensiones (mm)"
                        placeholder="ej. 150 x 50 x 30"
                        {...form.getInputProps('dimensions_mm')}
                      />

                      <NumberInput
                        label="Peso (g)"
                        {...form.getInputProps('weight_g')}
                      />

                      <Divider label="Rango operativo" />

                      <Grid>
                        <Grid.Col span={6}>
                          <NumberInput
                            label="Temp. operación mín. (°C)"
                            {...form.getInputProps('oper_temp_min_c')}
                          />
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <NumberInput
                            label="Temp. operación máx. (°C)"
                            {...form.getInputProps('oper_temp_max_c')}
                          />
                        </Grid.Col>
                      </Grid>

                      <Grid>
                        <Grid.Col span={6}>
                          <NumberInput
                            label="Humedad mín. (%)"
                            {...form.getInputProps('oper_humidity_min_pct')}
                          />
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <NumberInput
                            label="Humedad máx. (%)"
                            {...form.getInputProps('oper_humidity_max_pct')}
                          />
                        </Grid.Col>
                      </Grid>

                      <NumberInput
                        label="Altitud máxima (m)"
                        {...form.getInputProps('altitude_max_m')}
                      />
                    </Stack>
                  </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="variables" pt="md">
                  <Stack gap="md">
                    <Button leftSection={<IconPlus size={16} />} onClick={addVariable}>
                      Añadir Variable
                    </Button>

                    {form.values.variables.map((_, index) => (
                      <Paper key={index} p="md" withBorder>
                        <Stack gap="md">
                          <Group justify="space-between">
                            <Title order={5}>Variable #{index + 1}</Title>
                            <ActionIcon color="red" onClick={() => form.removeListItem('variables', index)}>
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>

                          <Select
                            label="Variable"
                            placeholder="Selecciona una variable"
                            data={variables.map(v => ({ value: v.variable_id.toString(), label: v.name }))}
                            searchable
                            {...form.getInputProps(`variables.${index}.variable_id`)}
                          />

                          <Grid>
                            <Grid.Col span={6}>
                              <NumberInput
                                label="Rango mínimo"
                                {...form.getInputProps(`variables.${index}.range_min`)}
                              />
                            </Grid.Col>
                            <Grid.Col span={6}>
                              <NumberInput
                                label="Rango máximo"
                                {...form.getInputProps(`variables.${index}.range_max`)}
                              />
                            </Grid.Col>
                          </Grid>

                          <TextInput
                            label="Unidad"
                            placeholder="ej. m/s, °C, PSI"
                            {...form.getInputProps(`variables.${index}.unit`)}
                          />

                          <Grid>
                            <Grid.Col span={6}>
                              <NumberInput
                                label="Precisión absoluta (±)"
                                {...form.getInputProps(`variables.${index}.accuracy_abs`)}
                              />
                            </Grid.Col>
                            <Grid.Col span={6}>
                              <NumberInput
                                label="Precisión relativa (%)"
                                {...form.getInputProps(`variables.${index}.accuracy_rel_pct`)}
                              />
                            </Grid.Col>
                          </Grid>

                          <Grid>
                            <Grid.Col span={6}>
                              <NumberInput
                                label="Resolución"
                                {...form.getInputProps(`variables.${index}.resolution`)}
                              />
                            </Grid.Col>
                            <Grid.Col span={6}>
                              <NumberInput
                                label="Tasa de actualización (Hz)"
                                {...form.getInputProps(`variables.${index}.update_rate_hz`)}
                              />
                            </Grid.Col>
                          </Grid>

                          <Textarea
                            label="Notas"
                            {...form.getInputProps(`variables.${index}.notes`)}
                          />
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="protocols" pt="md">
                  <Stack gap="md">
                    <Button leftSection={<IconPlus size={16} />} onClick={addProtocol}>
                      Añadir Protocolo
                    </Button>

                    {form.values.protocols.map((_, index) => (
                      <Paper key={index} p="md" withBorder>
                        <Stack gap="md">
                          <Group justify="space-between">
                            <Title order={5}>Protocolo #{index + 1}</Title>
                            <ActionIcon color="red" onClick={() => form.removeListItem('protocols', index)}>
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>

                          <Select
                            label="Tipo"
                            placeholder="Selecciona un protocolo"
                            data={[
                              { value: 'ModbusRTU', label: 'Modbus RTU' },
                              { value: 'ModbusTCP', label: 'Modbus TCP' },
                              { value: 'SDI12', label: 'SDI-12' },
                              { value: 'NMEA0183', label: 'NMEA 0183' },
                              { value: 'CANopen', label: 'CANopen' },
                              { value: 'Profinet', label: 'Profinet' },
                              { value: 'Other', label: 'Otro' }
                            ]}
                            {...form.getInputProps(`protocols.${index}.type`)}
                          />

                          <TextInput
                            label="Capa física"
                            placeholder="ej. RS-485, Ethernet"
                            {...form.getInputProps(`protocols.${index}.physical_layer`)}
                          />

                          <Grid>
                            <Grid.Col span={6}>
                              <TextInput
                                label="Puerto"
                                placeholder="ej. COM1, RJ45"
                                {...form.getInputProps(`protocols.${index}.port_label`)}
                              />
                            </Grid.Col>
                            <Grid.Col span={6}>
                              <TextInput
                                label="Dirección por defecto"
                                placeholder="ej. 1, 0x01"
                                {...form.getInputProps(`protocols.${index}.default_address`)}
                              />
                            </Grid.Col>
                          </Grid>

                          <Grid>
                            <Grid.Col span={6}>
                              <NumberInput
                                label="Baudrate"
                                placeholder="9600"
                                {...form.getInputProps(`protocols.${index}.baudrate`)}
                              />
                            </Grid.Col>
                            <Grid.Col span={6}>
                              <NumberInput
                                label="Databits"
                                {...form.getInputProps(`protocols.${index}.databits`)}
                              />
                            </Grid.Col>
                          </Grid>

                          <Grid>
                            <Grid.Col span={6}>
                              <Select
                                label="Parity"
                                data={[
                                  { value: 'N', label: 'None' },
                                  { value: 'E', label: 'Even' },
                                  { value: 'O', label: 'Odd' }
                                ]}
                                {...form.getInputProps(`protocols.${index}.parity`)}
                              />
                            </Grid.Col>
                            <Grid.Col span={6}>
                              <NumberInput
                                label="Stopbits"
                                {...form.getInputProps(`protocols.${index}.stopbits`)}
                              />
                            </Grid.Col>
                          </Grid>

                          <Grid>
                            <Grid.Col span={8}>
                              <TextInput
                                label="IP Address"
                                placeholder="192.168.1.100"
                                {...form.getInputProps(`protocols.${index}.ip_address`)}
                              />
                            </Grid.Col>
                            <Grid.Col span={4}>
                              <NumberInput
                                label="Puerto TCP/IP"
                                placeholder="502"
                                {...form.getInputProps(`protocols.${index}.ip_port`)}
                              />
                            </Grid.Col>
                          </Grid>

                          <Textarea
                            label="Notas"
                            {...form.getInputProps(`protocols.${index}.notes`)}
                          />
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="io" pt="md">
                  <Stack gap="md">
                    <div>
                      <Group justify="space-between" mb="md">
                        <Title order={4}>Salidas Analógicas</Title>
                        <Button size="xs" leftSection={<IconPlus size={14} />} onClick={addAnalogOutput}>
                          Añadir
                        </Button>
                      </Group>

                      {form.values.analog_outputs.map((_, index) => (
                        <Paper key={index} p="md" withBorder mb="md">
                          <Stack gap="md">
                            <Group justify="space-between">
                              <Title order={6}>Salida #{index + 1}</Title>
                              <ActionIcon color="red" size="sm" onClick={() => form.removeListItem('analog_outputs', index)}>
                                <IconTrash size={14} />
                              </ActionIcon>
                            </Group>

                            <Select
                              label="Tipo"
                              data={[
                                { value: 'Current_4_20mA', label: '4-20 mA' },
                                { value: 'Voltage_0_10V', label: '0-10 V' },
                                { value: 'Pulse', label: 'Pulso' },
                                { value: 'Relay', label: 'Relé' },
                                { value: 'TTL', label: 'TTL' },
                                { value: 'Other', label: 'Otro' }
                              ]}
                              {...form.getInputProps(`analog_outputs.${index}.type`)}
                            />

                            <NumberInput
                              label="Número de canales"
                              {...form.getInputProps(`analog_outputs.${index}.num_channels`)}
                            />

                            <Grid>
                              <Grid.Col span={4}>
                                <NumberInput
                                  label="Rango mín."
                                  {...form.getInputProps(`analog_outputs.${index}.range_min`)}
                                />
                              </Grid.Col>
                              <Grid.Col span={4}>
                                <NumberInput
                                  label="Rango máx."
                                  {...form.getInputProps(`analog_outputs.${index}.range_max`)}
                                />
                              </Grid.Col>
                              <Grid.Col span={4}>
                                <TextInput
                                  label="Unidad"
                                  {...form.getInputProps(`analog_outputs.${index}.unit`)}
                                />
                              </Grid.Col>
                            </Grid>

                            <Grid>
                              <Grid.Col span={6}>
                                <NumberInput
                                  label="Carga mín. (Ω)"
                                  {...form.getInputProps(`analog_outputs.${index}.load_min_ohm`)}
                                />
                              </Grid.Col>
                              <Grid.Col span={6}>
                                <NumberInput
                                  label="Carga máx. (Ω)"
                                  {...form.getInputProps(`analog_outputs.${index}.load_max_ohm`)}
                                />
                              </Grid.Col>
                            </Grid>
                          </Stack>
                        </Paper>
                      ))}
                    </div>

                    <Divider />

                    <div>
                      <Group justify="space-between" mb="md">
                        <Title order={4}>E/S Digitales</Title>
                        <Button size="xs" leftSection={<IconPlus size={14} />} onClick={addDigitalIO}>
                          Añadir
                        </Button>
                      </Group>

                      {form.values.digital_io.map((_, index) => (
                        <Paper key={index} p="md" withBorder mb="md">
                          <Stack gap="md">
                            <Group justify="space-between">
                              <Title order={6}>E/S #{index + 1}</Title>
                              <ActionIcon color="red" size="sm" onClick={() => form.removeListItem('digital_io', index)}>
                                <IconTrash size={14} />
                              </ActionIcon>
                            </Group>

                            <Grid>
                              <Grid.Col span={6}>
                                <Select
                                  label="Dirección"
                                  data={[
                                    { value: 'input', label: 'Entrada' },
                                    { value: 'output', label: 'Salida' }
                                  ]}
                                  {...form.getInputProps(`digital_io.${index}.direction`)}
                                />
                              </Grid.Col>
                              <Grid.Col span={6}>
                                <Select
                                  label="Tipo de señal"
                                  data={[
                                    { value: 'Current_4_20mA', label: '4-20 mA' },
                                    { value: 'Voltage_0_10V', label: '0-10 V' },
                                    { value: 'Pulse', label: 'Pulso' },
                                    { value: 'Relay', label: 'Relé' },
                                    { value: 'TTL', label: 'TTL' },
                                    { value: 'Other', label: 'Otro' }
                                  ]}
                                  {...form.getInputProps(`digital_io.${index}.signal_type`)}
                                />
                              </Grid.Col>
                            </Grid>

                            <TextInput
                              label="Nivel de voltaje"
                              placeholder="ej. 3.3V, 5V"
                              {...form.getInputProps(`digital_io.${index}.voltage_level`)}
                            />

                            <Grid>
                              <Grid.Col span={6}>
                                <NumberInput
                                  label="Corriente máx. (mA)"
                                  {...form.getInputProps(`digital_io.${index}.current_max_ma`)}
                                />
                              </Grid.Col>
                              <Grid.Col span={6}>
                                <NumberInput
                                  label="Frecuencia máx. (Hz)"
                                  {...form.getInputProps(`digital_io.${index}.frequency_max_hz`)}
                                />
                              </Grid.Col>
                            </Grid>
                          </Stack>
                        </Paper>
                      ))}
                    </div>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="modbus" pt="md">
                  <Stack gap="md">
                    <Button leftSection={<IconPlus size={16} />} onClick={addModbusRegister}>
                      Añadir Registro
                    </Button>

                    <Paper withBorder style={{ overflowX: 'auto' }}>
                      <Table>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>FC</Table.Th>
                            <Table.Th>Dir.</Table.Th>
                            <Table.Th>Nombre</Table.Th>
                            <Table.Th>Tipo</Table.Th>
                            <Table.Th>Unidad</Table.Th>
                            <Table.Th>R/W</Table.Th>
                            <Table.Th></Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {form.values.modbus_registers.map((_, index) => (
                            <Table.Tr key={index}>
                              <Table.Td>
                                <NumberInput
                                  size="xs"
                                  w={60}
                                  {...form.getInputProps(`modbus_registers.${index}.function_code`)}
                                />
                              </Table.Td>
                              <Table.Td>
                                <NumberInput
                                  size="xs"
                                  w={80}
                                  {...form.getInputProps(`modbus_registers.${index}.address`)}
                                />
                              </Table.Td>
                              <Table.Td>
                                <TextInput
                                  size="xs"
                                  placeholder="Nombre"
                                  {...form.getInputProps(`modbus_registers.${index}.name`)}
                                />
                              </Table.Td>
                              <Table.Td>
                                <Select
                                  size="xs"
                                  w={100}
                                  data={['UINT16', 'INT16', 'UINT32', 'INT32', 'FLOAT32', 'BOOL']}
                                  {...form.getInputProps(`modbus_registers.${index}.datatype`)}
                                />
                              </Table.Td>
                              <Table.Td>
                                <TextInput
                                  size="xs"
                                  w={80}
                                  placeholder="Unidad"
                                  {...form.getInputProps(`modbus_registers.${index}.unit`)}
                                />
                              </Table.Td>
                              <Table.Td>
                                <Select
                                  size="xs"
                                  w={70}
                                  data={['R', 'W', 'RW']}
                                  {...form.getInputProps(`modbus_registers.${index}.rw`)}
                                />
                              </Table.Td>
                              <Table.Td>
                                <ActionIcon
                                  color="red"
                                  size="sm"
                                  onClick={() => form.removeListItem('modbus_registers', index)}
                                >
                                  <IconTrash size={14} />
                                </ActionIcon>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    </Paper>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="tags" pt="md">
                  <Paper p="md" withBorder>
                    <Stack gap="md">
                      <TextInput
                        label="Añadir etiquetas (separadas por coma)"
                        placeholder="sensor, temperatura, submarino"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.currentTarget;
                            const tags = input.value.split(',').map(t => t.trim()).filter(t => t);
                            form.setFieldValue('tags', [...form.values.tags, ...tags]);
                            input.value = '';
                          }
                        }}
                      />

                      <Group gap="xs">
                        {form.values.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            rightSection={
                              <ActionIcon
                                size="xs"
                                color="blue"
                                radius="xl"
                                variant="transparent"
                                onClick={() => form.removeListItem('tags', index)}
                              >
                                <IconTrash size={10} />
                              </ActionIcon>
                            }
                          >
                            {tag}
                          </Badge>
                        ))}
                      </Group>
                    </Stack>
                  </Paper>
                </Tabs.Panel>
              </Tabs>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 5 }}>
            <Paper p="md" withBorder style={{ position: 'sticky', top: 20 }}>
              <Title order={4} mb="md">Vista previa JSON</Title>
              <div style={{ maxHeight: 'calc(100vh - 150px)', overflow: 'auto' }}>
                <JsonView data={getPreviewObject()} shouldExpandNode={allExpanded} style={defaultStyles} />
              </div>
            </Paper>
          </Grid.Col>
        </Grid>
      </form>

      {/* Modal para crear nuevo artículo SAP */}
      <Modal
        opened={articleModalOpened}
        onClose={() => setArticleModalOpened(false)}
        title="Crear Nuevo Artículo SAP"
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Article ID (Código Interno)"
            placeholder="ej. INS-000347"
            required
            value={newArticle.article_id}
            onChange={(e) => setNewArticle({ ...newArticle, article_id: e.target.value })}
            description="Código maestro interno del artículo"
          />

          <TextInput
            label="SAP ItemCode"
            placeholder="ej. A1000012"
            value={newArticle.sap_itemcode}
            onChange={(e) => setNewArticle({ ...newArticle, sap_itemcode: e.target.value })}
            description="ItemCode en SAP Business One"
          />

          <Textarea
            label="Descripción SAP"
            placeholder="ej. Estación Meteorológica OTT WS600 DLUV"
            required
            minRows={2}
            value={newArticle.sap_description}
            onChange={(e) => setNewArticle({ ...newArticle, sap_description: e.target.value })}
          />

          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Familia"
                placeholder="ej. Sensores, Dataloggers"
                value={newArticle.family}
                onChange={(e) => setNewArticle({ ...newArticle, family: e.target.value })}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Subfamilia"
                placeholder="ej. Meteorología, CTD"
                value={newArticle.subfamily}
                onChange={(e) => setNewArticle({ ...newArticle, subfamily: e.target.value })}
              />
            </Grid.Col>
          </Grid>

          <Textarea
            label="Notas Internas"
            placeholder="Información adicional o notas sobre el artículo"
            minRows={3}
            value={newArticle.internal_notes}
            onChange={(e) => setNewArticle({ ...newArticle, internal_notes: e.target.value })}
          />

          <Checkbox
            label="Artículo activo"
            checked={newArticle.active}
            onChange={(e) => setNewArticle({ ...newArticle, active: e.currentTarget.checked })}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => setArticleModalOpened(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateArticle}
              disabled={!newArticle.article_id || !newArticle.sap_description}
            >
              Crear Artículo SAP
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

